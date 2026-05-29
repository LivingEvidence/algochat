# mCRPC Trial Data Schema

Place the trial extraction workbook at `api/data/mcrpc/data.xlsx`.

When that file exists, the agent will enable the `execute_python` tool and expose:

- `df`: the primary trial DataFrame
- `sheets`: a dictionary of all Excel sheets
- `get_sheet(name)`: helper for retrieving a sheet by name

Update this schema with actual sheet names and column definitions when the workbook is added.
