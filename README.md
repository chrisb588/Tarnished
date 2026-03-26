# Freshlast

Freshlast is a project developed by Team Tarnished. Freshlast is developed
as a partial requirement for the course CMSC 129: Software Engineering II.

## Dev Setup

### Backend

Create a virtual environment using `uv`. This requires `uv` to be installed in your system
by running `pip install uv`

```bash
uv venv .venv
```

Alternatively, you can create a virtual environment using `venv`

```bash
python -m venv .venv
```

Then activate the virtual environment. Make sure that you are in
`backend` directory by running `cd backend` from the project root directory.

**Mac/Linux**
```bash
source .venv/bin/activate
```

**Windows (using Powershell)**
```powershell
.venv\Scripts\Activate.ps1
```

Install dependencies from `requirements.txt`

**Using `uv`**
```bash
uv pip install -r requirements.txt
```

**Using `venv`**
```bash
pip install -r requirements.txt
```

Create an `app/.env` file from `app/.env.example`. Further details are explained in `app/.env.example`

```ini
DATABASE_URL=https://xxxx.supabase.co
SECRET_KEY=your-secret-key
```

Finally, run the FastAPI app

```bash
uvicorn main:app --reload
```

After developing, make sure to deactivate your virtual environment

```bash
deactivate
```

## Test Setup

### Backend

**NOTE**: Ensure that you have already configured the FastAPI project before proceeding.
Refer to [Dev Setup](#backend) for details on configuring the FastAPI project.

Ensure that your virtual environment is activated

**Mac/Linux**
```bash
# cd backend if not yet already
source .venv/bin/activate
```

**Windows (using Powershell)**
```powershell
# cd backend if not yet already
.venv\Scripts\Activate.ps1
```

Run the local Supabase instance
```bash
npx supabase start
```

Create a `tests/.env.test` file from `tests/.env.test.example`. Further details are explained in `tests/.env.test.example`

```ini
DATABASE_URL=http://127.0.0.1:54321
SECRET_KEY=your-secret-key
```

Finally, execute all testcases

```bash
pytest
```
