from __future__ import annotations

import logging
import json
import traceback
from contextlib import redirect_stderr, redirect_stdout
from io import StringIO
from typing import Any

import numpy as np
import pandas as pd
from claude_agent_sdk import tool


logger = logging.getLogger(__name__)
MAX_OUTPUT_ROWS = 200


class CodeExecutor:
    FORBIDDEN_BUILTINS = {
        "exec",
        "eval",
        "compile",
        "open",
        "input",
        "globals",
        "locals",
        "vars",
        "__import__",
        "exit",
        "quit",
        "breakpoint",
    }

    def __init__(self, xlsx_path: str):
        self.xlsx_path = xlsx_path
        xlsx = pd.ExcelFile(xlsx_path)
        self.sheets = {
            sheet_name: pd.read_excel(xlsx, sheet_name=sheet_name)
            for sheet_name in xlsx.sheet_names
        }
        if "itable" in self.sheets:
            raw_df = pd.read_excel(xlsx, sheet_name="itable", header=None)
            if len(raw_df.index) >= 2:
                data_df = raw_df.iloc[2:].reset_index(drop=True)
                data_df.columns = raw_df.iloc[1].fillna("").astype(str).tolist()
                self.main_df = data_df
            else:
                self.main_df = self.sheets["itable"]
        else:
            first_sheet = xlsx.sheet_names[0]
            self.main_df = self.sheets[first_sheet]

        logger.info(
            "Loaded trial data from %s with %s rows and %s columns",
            xlsx_path,
            len(self.main_df),
            len(self.main_df.columns),
        )

    def execute(self, code: str) -> dict[str, Any]:
        safe_globals = self._createSafeGlobals()
        safe_globals["df"] = self.main_df.copy()
        safe_globals["sheets"] = {name: df.copy() for name, df in self.sheets.items()}
        safe_globals["get_sheet"] = lambda name: self.sheets.get(name, pd.DataFrame()).copy()

        stdout_buffer = StringIO()
        stderr_buffer = StringIO()
        error = None
        result = None

        try:
            compiled = compile(code, "<agent_code>", "exec")
            with redirect_stdout(stdout_buffer), redirect_stderr(stderr_buffer):
                exec(compiled, safe_globals)
                result = safe_globals.get("result")
        except SyntaxError as exc:
            error = f"SyntaxError: {exc.msg} at line {exc.lineno}"
        except Exception as exc:
            error = f"{type(exc).__name__}: {exc}\n{traceback.format_exc()}"

        output = stdout_buffer.getvalue()
        stderr_output = stderr_buffer.getvalue()
        if stderr_output:
            output = f"{output}\nSTDERR:\n{stderr_output}".strip()

        return {
            "success": error is None,
            "output": output.strip(),
            "result": self._serializeResult(result),
            "error": error,
        }

    def _createSafeGlobals(self) -> dict[str, Any]:
        import builtins

        safe_builtins = {
            name: getattr(builtins, name)
            for name in dir(builtins)
            if name not in self.FORBIDDEN_BUILTINS
        }
        return {
            "__builtins__": safe_builtins,
            "pd": pd,
            "pandas": pd,
            "np": np,
            "numpy": np,
        }

    def _serializeResult(self, result: Any) -> Any:
        if result is None:
            return None
        if isinstance(result, pd.DataFrame):
            data = result.head(MAX_OUTPUT_ROWS).fillna("").to_dict(orient="records")
            return {
                "type": "dataframe",
                "columns": result.columns.tolist(),
                "data": data,
                "total_rows": len(result),
                "truncated": len(result) > MAX_OUTPUT_ROWS,
            }
        if isinstance(result, pd.Series):
            return {
                "type": "series",
                "name": result.name,
                "data": result.head(MAX_OUTPUT_ROWS).fillna("").to_dict(),
                "total_items": len(result),
                "truncated": len(result) > MAX_OUTPUT_ROWS,
            }
        if isinstance(result, np.ndarray):
            flat = result.flatten()
            return {
                "type": "array",
                "shape": result.shape,
                "data": flat[:MAX_OUTPUT_ROWS].tolist(),
                "truncated": len(flat) > MAX_OUTPUT_ROWS,
            }
        if isinstance(result, (np.integer, np.floating)):
            return float(result)
        if isinstance(result, np.bool_):
            return bool(result)
        if isinstance(result, (list, tuple)):
            return [self._serializeResult(item) for item in result[:100]]
        if isinstance(result, dict):
            return {str(k): self._serializeResult(v) for k, v in list(result.items())[:100]}
        if isinstance(result, (str, int, float, bool)):
            return result
        return str(result)


def get_execute_python_tool(xlsx_path: str) -> Any:
    executor = CodeExecutor(xlsx_path)

    @tool(
        "execute_python",
        "Execute Python pandas code against the loaded mCRPC trial dataset. Store the final answer in `result`.",
        {
            "type": "object",
            "properties": {
                "code": {
                    "type": "string",
                    "description": "Python pandas code to execute against df, sheets, and get_sheet.",
                }
            },
            "required": ["code"],
        },
    )
    async def execute_python(args: dict[str, Any]) -> dict[str, Any]:
        result = executor.execute(str(args.get("code", "")))
        return {
            "content": [
                {
                    "type": "text",
                    "text": json.dumps(result, ensure_ascii=False),
                }
            ],
            "is_error": not result.get("success", False),
        }

    return execute_python
