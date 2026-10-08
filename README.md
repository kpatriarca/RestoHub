# RestoHub

Restaurant Directory & Database Management System built for an Advanced Database Systems project.

## Technology

- HTML5, CSS3, and vanilla JavaScript
- Node.js and Express.js
- MongoDB Atlas with the official MongoDB Node.js driver

## Installation

1. Install Node.js 18 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env` and replace the placeholder username and password with your MongoDB Atlas credentials.

```env
MONGODB_URI=mongodb+srv://YOUR_DB_USERNAME:YOUR_DB_PASSWORD@cluster0.jm3qnis.mongodb.net/?appName=Cluster0
DB_NAME=dbRestaurants
PORT=3000
```

Allow your current IP address in MongoDB Atlas Network Access and ensure the database user can read and write the database.

## Run

Use `npm run dev` during development or `npm start` for a normal server. Open `http://localhost:3000`.

## Database

The application uses the `dbRestaurants` database and the `restaurants` collection. Restaurant documents store an embedded `address` object and a `grades` array. The newest dated grade is used as the current grade and score. Editing a changed grade or score appends a new inspection and keeps earlier history.

The optional seed script inserts 31 sample records only when the collection is empty:

```bash
npm run seed
```

It never clears or overwrites an existing collection.

## API

- `GET /api/restaurants` — paginated search and filters
- `GET /api/restaurants/meta` — distinct filter values
- `GET /api/restaurants/best-quality` — aggregation ranked by lowest average inspection score
- `GET /api/restaurants/:id`
- `POST /api/restaurants`
- `PUT /api/restaurants/:id`
- `DELETE /api/restaurants/:id`
- `GET /api/stats`
