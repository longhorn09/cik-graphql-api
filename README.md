# CIK GraphQL API

A Fastify-based GraphQL API with Mercurius integration and GCP CloudSQL MySQL backend.

## Features

- 🚀 Fastify web framework for high performance
- 📊 GraphQL API with Mercurius integration
- 🗄️ GCP CloudSQL MySQL integration with connection pooling
- 🔄 Automatic database schema initialization
- 📝 User and Post management with relationships
- 🏥 Health check endpoints
- 🛡️ Graceful shutdown handling
- 📦 ES6+ module syntax with strict mode

## Prerequisites

- Node.js 18+ 
- GCP CloudSQL MySQL instance
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cik-graphql-api
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`:
```env
# Server Configuration
PORT=3000
HOST=0.0.0.0
NODE_ENV=development
LOG_LEVEL=info

# Database Configuration (GCP CloudSQL MySQL)
DB_HOST=your-cloudsql-instance-ip
DB_PORT=3306
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_NAME=cik_database
DB_SSL=true

# Database Pool Configuration
DB_POOL_SIZE=10
DB_ACQUIRE_TIMEOUT=60000
DB_TIMEOUT=60000
DB_QUERY_TIMEOUT=30000
```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## API Endpoints

- **GraphQL**: `http://localhost:3000/graphql`
- **GraphiQL Interface**: `http://localhost:3000/graphql` (development only)
- **Health Check**: `http://localhost:3000/health`
- **API Info**: `http://localhost:3000/`

## GraphQL Schema

### Types

#### User
```graphql
type User {
  id: ID!
  email: String!
  name: String!
  posts: [Post!]
  createdAt: String!
  updatedAt: String!
}
```

#### Post
```graphql
type Post {
  id: ID!
  title: String!
  content: String
  user: User!
  createdAt: String!
  updatedAt: String!
}
```

### Queries

```graphql
# Get all users
query {
  users(limit: 10, offset: 0) {
    id
    name
    email
    posts {
      id
      title
    }
  }
}

# Get user by ID
query {
  user(id: "1") {
    id
    name
    email
    posts {
      id
      title
      content
    }
  }
}

# Get all posts
query {
  posts(limit: 10, offset: 0) {
    id
    title
    content
    user {
      id
      name
    }
  }
}

# Health check
query {
  health {
    status
    timestamp
    database
  }
}
```

### Mutations

```graphql
# Create user
mutation {
  createUser(input: {
    email: "newuser@example.com"
    name: "New User"
  }) {
    id
    email
    name
  }
}

# Create post
mutation {
  createPost(input: {
    title: "My First Post"
    content: "This is the content of my first post"
    userId: "1"
  }) {
    id
    title
    content
    user {
      id
      name
    }
  }
}

# Update user
mutation {
  updateUser(id: "1", input: {
    name: "Updated Name"
  }) {
    id
    name
    email
  }
}

# Delete user
mutation {
  deleteUser(id: "1") {
    success
    message
    id
  }
}
```

## Database Schema

The application automatically creates the following tables:

### Users Table
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Posts Table
```sql
CREATE TABLE posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  user_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## GCP CloudSQL Configuration

1. **Enable Cloud SQL Admin API** in your GCP project
2. **Create a Cloud SQL instance** with MySQL
3. **Configure connection**:
   - Use the instance connection name
   - Enable SSL for secure connections
   - Create a database user with appropriate permissions
4. **Update environment variables** with your Cloud SQL connection details

## Development

### Project Structure
```
├── index.js                 # Main application entry point
├── src/
│   ├── services/
│   │   └── database.js      # Database service with GCP CloudSQL integration
│   ├── schema/
│   │   └── schema.js        # GraphQL schema definition
│   └── resolvers/
│       └── resolvers.js     # GraphQL resolvers
├── package.json
└── README.md
```

### Adding New Features

1. **Add new types** to `src/schema/schema.js`
2. **Add resolvers** to `src/resolvers/resolvers.js`
3. **Add database methods** to `src/services/database.js` if needed

## Error Handling

The application includes comprehensive error handling:
- Database connection errors
- GraphQL query errors
- Validation errors
- Graceful shutdown handling

## Logging

Uses Pino logger with pretty printing in development:
- Request/response logging
- Database operation logging
- Error logging
- Health check logging

## Security Considerations

- Use environment variables for sensitive configuration
- Enable SSL for database connections
- Implement proper authentication/authorization (to be added)
- Use connection pooling for database efficiency
- Input validation and sanitization

## License

ISC
