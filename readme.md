# ExpenseTracker User Service

The **ExpenseTracker User Service** is a RESTful microservice responsible for managing user profile operations in the ExpenseTracker application.

## Features

- User profile management (view, update)
- Role-based access control (if applicable)
- Integration-ready for the ExpenseTracker ecosystem

## Getting Started

### Prerequisites

- Node.js (v14 or higher recommended)
- npm or yarn
- A Postgres database.

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/gagan-upadhyay/expensetracker-user-service.git
cd expensetracker-user-service
npm install
```

### Environment Configuration

Copy `.env.example` to `.env` and update the variables according to your setup:

```bash
cp .env.example .env
```

### Running the Service

```bash
npm run dev
```

By default, the service will be available at `http://localhost:PORT`.
#Port as specified in the .env file


## API Endpoints


- `GET /api/v1/users/me` - Get current user profile (authentication required)
- `PUT /api/v1/users/me` - Update user profile

## Testing

```bash
npm test
```

## Directory Structure

```
src/
  controllers/
  models/
  routes/
  middlewares/
  services/
.env.example
README.md
```

## Contributing

Contributions are welcome! Please open issues or pull requests for any improvements.

## License

MIT

---

*Happy tracking!*