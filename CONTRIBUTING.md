# Contributing to the Online Auction System

Thank you for your interest in contributing to the Online Auction System! We welcome contributions of all kinds, whether it’s bug fixes, new features, or improvements to the documentation. Please follow the guidelines below to help us maintain a collaborative and effective project.

## How to Contribute

### 1. Fork the Repository
- Click the "Fork" button at the top right corner of this repository to create your own copy.

### 2. Clone Your Fork
- Clone your forked repository to your local machine:
  ```bash
  git clone https://github.com/YOUR_USERNAME/Online-Auction-System.git
  cd Online-Auction-System
  ```

### 3. Create a New Branch
- Before making changes, create a new branch for your feature or bug fix:
  ```bash
  git checkout -b your-feature-name
  ```

### 4. Make Your Changes
- Implement your feature or fix the bug. Make sure to follow the existing code style and conventions used in the project.

### 5. Test Your Changes
- Start a database with `make db-up DB=mysql` (or `DB=postgres`), then run `make test-mysql` / `make test-postgres`.
- Run `make test-all` before opening a pull request, and `cd server && pnpm lint` for the API.
- If you changed the UI, start the stack with `make up DB=mysql` and exercise the flow in a browser.

### 6. Commit Your Changes
- Stage only the files you changed, then commit with a clear message:
  ```bash
  git add <paths>
  git commit -m "Add a short description of your changes"
  ```
- Never stage `.env` files or database volumes; both are ignored by default.

### 7. Push to Your Fork
- Push your changes back to your forked repository:
  ```bash
  git push origin your-feature-name
  ```

### 8. Create a Pull Request
- Navigate to the original repository and click on the “New Pull Request” button.
- Select your branch and provide a detailed description of your changes.

## Guidelines for Contributions

- **One SQL source**: application SQL belongs in `server/src/queries/`, written with `:named` parameters. Controllers must not contain SQL strings.
- **Dual-engine parity**: keep `database/mysql/` and `database/postgres/` in sync, and use lowercase identifiers so the shared queries work on both.
- **Layering**: routes wire paths and guards; controllers handle HTTP; `server/src/db/` is the only place that knows about a driver.
- **Code quality**: run `pnpm lint` in `server/` and keep the client build warning-free.
- **Documentation**: update `README.md`, `SETUP.md`, or `database/README.md` when behavior or setup changes. Never pin prose in tests.
- **Issues**: check existing issues first; include reproduction steps, expected vs. actual behaviour, and the engine you used.

## Reporting Issues

If you find a bug or have a feature request, please open an issue in the GitHub repository. Make sure to provide as much detail as possible, including:
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots (if applicable)

## Code of Conduct

We expect all contributors to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md). Be respectful and considerate to fellow contributors and maintain a positive environment.

## Resources

- [Project Demo Video](https://github.com/user-attachments/assets/b93b3b77-e1bc-4d35-8c14-638d192a6f94) - A video demonstration of the Online Auction System in action.

Thank you for your contributions! Together, we can make the Online Auction System better for everyone. Happy coding! 🎉