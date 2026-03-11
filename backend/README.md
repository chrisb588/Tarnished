# FreshLast Backend

## Setup Guide

### Setup virtual environment

*[RECOMMENDED]:* Create virtual environment using `uv` in `/backend` directory if you haven't already.

```bash
pip install uv # Install if you haven't already
uv venv
```

Alternatively, you can create an environment using the built-in `venv` module.

```bash
python -m venv venv
```

Then activate virtual environment.

```bash
source venv/bin/activate # or ./venv/bin/Activate.ps1 if you're using Powershell
```

### Initial setup

Install dependencies from `requirements.txt`

```bash
uv pip install -r requirements.txt

# or pip install -r requirements.txt
```

Add the necessary environment variables in `/app/.env` and `./tests/.env.test`.

### Run backend

Run the backend app using `uvicorn`

```bash
uvicorn main:app --reload
```

## Testing Guide

### Easy Way

*[WARNING]:* Testing the easy way will use the remote Supabase instance. It is possible that your test cases will perform unwanted changes in the database. To prevent this, you can opt for [configuring a local Supabase instance](#using-supabase-cli).

To perform testing the easy way, first change directory to `/tests`

```bash
cd tests
```

Configure environment variables in `.env.test` to reflect what you have in your `/app/.env`.

Run all tests using `pytest`

```bash
pytest
```

### Using Supabase CLI

*[RECOMMENDED]:* You can use a local Supabase instance to run your tests. Any changes in the database will only reflect in your local Supabase instance.

To perform testing using your local Supabase instance, first change directory to `/tests`

```bash
cd tests
```

Install Supabase CLI. You may refer to the [docs](https://supabase.com/docs/guides/local-development/cli/getting-started?queryGroups=platform&platform=windows&queryGroups=access-method&access-method=analytics#installing-the-supabase-cli) on how to install depending on your operating system.

Setup Docker Desktop or any Docker-compatible container tool to manage Docker
containers. You may refer to the
[documentation](https://supabase.com/docs/guides/local-development/cli/getting-started?queryGroups=platform&platform=windows&queryGroups=access-method&access-method=analytics#running-supabase-locally)
for a guide. Ensure that your container tool is actively running before proceeding to the next steps.

Once you have setup both your Supabase CLI and Docker Desktop (or any
Docker-compatible container tool) successfully, start your local Supabase
instance.

```bash
supabase start --debug
# or npx supabase start --debug if you installed Supabase CLI using npm
```

Configure environment variables in `.env.test` from the output of `supabase
start`. Refer to *Studio* under *Development Tools* for `DATABASE_URL` and
*Secret* under *Authentication Keys* for `SECRET_KEY`

Run all tests using `pytest`

```bash
pytest
```

After testing, you can stop running the local Supabase instance.

```bash
supabase stop
# or npx supabase stop
```

## Supabase CLI

To learn more about how to use and develop with Supabase CLI, refer to its
[official documentation](https://supabase.com/docs/guides/local-development/cli/getting-started)
