
## API Client Generation

This project uses [swagger-typescript-api](https://github.com/acacode/swagger-typescript-api) to generate a TypeScript API client from the OpenAPI specification.

### Generate API Client

To generate the API client, you need to:

**If running locally**
```bash
npm run generate:api-client
```
If running in Docker
```bash
docker exec -ti gateway npm run generate:api-client
```

### Using the Generated API Client

The generated API client will be available in the `../generated` directory. You can import and use it in your frontend project:

```typescript
import { Api } from 'path/to/generated/api';

// Create an instance of the API client
const api = new Api({
  baseUrl: 'http://localhost:3000/api',
  // Optional: Add custom headers, authentication, etc.
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// Use the API client
async function fetchData() {
  try {
    // Example: Get users
    const { data } = await api.users.getUsers();
    console.log(data);

    // Example: Create a user
    const { data: newUser } = await api.users.createUser({ 
      name: 'John Doe', 
      email: 'john@example.com' 
    });
    console.log(newUser);
  } catch (error) {
    console.error('API error:', error);
  }
}
```

### Client Configuration

The generated API client uses Axios for HTTP requests. You can customize the client configuration when creating an instance:

```typescript
const api = new Api({
  baseUrl: 'http://localhost:3000/api',
  timeout: 5000, // 5 seconds
  withCredentials: true, // Include cookies in cross-site requests
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
});
```

## Migrations processes 

### Generate new migration
If running locally
```bash
npm run migration:generate
```
If running in Docker
```bash
docker exec -ti gateway npm run migration:generate
```

### Run migrations
If running locally
```bash
npm run migration:run
```
If running in Docker
```bash
docker exec -ti gateway npm run migration:run
```

### Revert last migration
```bash
# If running locally
npm run migration:revert

# If running in Docker
docker exec -ti gateway npm run migration:revert
```

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod


## Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## License

[MIT licensed](LICENSE).
