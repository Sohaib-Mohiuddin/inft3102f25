# Basic Laravel Application (Docker Dev Setup)

This is a minimal Laravel 11 skeleton set up for local development using Docker. It includes PHP, Composer, Node/Vite for asset bundling, and a MariaDB 11 database container.

---

## Quick Start (Numbered Steps)

1) Prerequisites
	- Docker & Docker Compose
	- (Optional) `grep`, `bash`, `make` (if you add Makefile helpers later)

2) Clone the repository
```
git clone <repo-url> && cd inft3102f25/laravel-app
```

3) Create your environment file
```
cp src/.env.example src/.env
```
Adjust anything needed (app name, database, mail, etc.). Update DB section to match the MariaDB service (if not already set):
```
DB_CONNECTION=mysql
DB_HOST=db
DB_PORT=3306
DB_DATABASE=laravel
DB_USERNAME=laravel
DB_PASSWORD=laravel
```
You can connect from a local MySQL client on the host using port 3307 (mapped to container 3306):
```
mysql -h 127.0.0.1 -P 3307 -u laravel -p
```

4) Build & start the containers (detached)
```
docker compose -f docker-compose.dev.yml up --build -d
```

5) Install PHP dependencies (Composer inside container)
```
docker compose -f docker-compose.dev.yml run --rm php composer install
```

6) Generate the Laravel app key
```
docker compose -f docker-compose.dev.yml run --rm php php artisan key:generate
```

7) Install JS dependencies & build assets (Vite)
```
docker compose -f docker-compose.dev.yml run --rm node npm install
docker compose -f docker-compose.dev.yml run --rm node npm run dev
```
Leave a Vite dev server running (hot reload) if desired:
```
docker compose -f docker-compose.dev.yml run --rm --service-ports node npm run dev
```

8) Serve the application
The PHP container (if using `artisan serve` pattern) or a web server will expose the app—visit:
```
http://localhost:8000
```
If you adapt to nginx + php-fpm later, update this section accordingly.

9) Run the test suite
```
docker compose -f docker-compose.dev.yml run --rm php ./vendor/bin/phpunit
```

10) Storage symlink & permissions (useful in dev)
Create the storage symlink (serves uploaded files via `public/storage`):
```
docker compose -f docker-compose.dev.yml run --rm php php artisan storage:link
```
Fix permissions so Laravel can write cache/logs:
```
docker compose -f docker-compose.dev.yml run --rm php sh -lc "chown -R www-data:www-data storage bootstrap/cache && chmod -R ug+rw storage bootstrap/cache"
```
Why: avoids "cannot write" errors and lets you serve files from storage.

11) Migrate / seed the database (run after containers are healthy)
```
docker compose -f docker-compose.dev.yml run --rm php php artisan migrate
# docker compose -f docker-compose.dev.yml run --rm php php artisan db:seed
```
Comment in the seed command if you add seeders / factories you want to load.

---

## Common Maintenance Commands
Rebuild after changing dependencies:
```
docker compose -f docker-compose.dev.yml build --no-cache php
```
Bring everything down:
```
docker compose -f docker-compose.dev.yml down -v
```

Clear caches (config/view/route):
```
docker compose -f docker-compose.dev.yml run --rm php php artisan optimize:clear
```

Tinker (REPL):
```
docker compose -f docker-compose.dev.yml run --rm php php artisan tinker
```

## Directory Highlights
`src/app/` – Application code (models, controllers, providers)
`src/routes/web.php` – Web routes
`src/resources/views/` – Blade templates
`src/database/migrations/` – Schema changes
`src/database/factories/` – Model factories (testing/seed)
`src/tests/` – PHPUnit tests

## Environment Notes
MariaDB 11 runs in the `db` service (see `docker-compose.dev.yml`). Data persists in the named volume `db_data`.

External connection (host machine) uses mapped port 3307 → container 3306. Example DSN from host:
```
mysql://laravel:laravel@127.0.0.1:3307/laravel
```
If you change credentials in compose, keep `.env` synchronized or migrations will fail with an authentication error.

Reset database (DANGEROUS – deletes all data):
```
docker compose -f docker-compose.dev.yml down -v && \
docker compose -f docker-compose.dev.yml up -d && \
docker compose -f docker-compose.dev.yml run --rm php php artisan migrate:fresh --seed
```

## Troubleshooting
White page / 500: check `src/storage/logs/laravel.log`.
Permission denied: re-run step 10 (permissions) or ensure your host filesystem allows Docker to change ownership.
Env vars not updating: run `optimize:clear`.

## Next Ideas
- Add Makefile for shorter commands
- Switch to nginx + php-fpm for closer prod parity
- Add CI workflow running PHPUnit & Pint (code style)

## License
This project follows the original Laravel framework license (MIT). See upstream Laravel for details.

