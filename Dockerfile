# Use PHP 8.2 (Required for modern Composer dependencies)
FROM php:8.2-apache

# Install required extensions
RUN docker-php-ext-install pdo pdo_mysql

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Install Node.js v20 (Required for Vite/React)
RUN apt-get update && apt-get install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash -

# Install system dependencies
RUN apt-get update && apt-get install -y \
    apt-utils \
    nodejs \
    git \
    zip \
    unzip \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libpq-dev \
    sqlite3 \
    libsqlite3-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo pdo_mysql mbstring exif pcntl bcmath gd zip \
    && rm -rf /var/lib/apt/lists/*

RUN pecl install redis && docker-php-ext-enable redis

# --- FIX START: Configure Apache to serve from /public ---
ENV APACHE_DOCUMENT_ROOT /var/www/html/public

RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf
# --- FIX END ---

WORKDIR /var/www/html

# Backend Build
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-scripts --ignore-platform-reqs

COPY app/ ./app/
COPY public/ ./public/

RUN composer dump-autoload --optimize --no-scripts 

# Frontend Build
WORKDIR /var/www/html/frontendAnony
COPY frontendAnony/package*.json ./
RUN npm install
COPY frontendAnony/ .
RUN npm run build
RUN cp -r dist/* ../public/

# Final Config
WORKDIR /var/www/html

# Enable mod_rewrite
RUN a2enmod rewrite

# Permissions
RUN chown -R www-data:www-data /var/www/html
RUN chmod -R 755 /var/www/html

RUN find /var/www/html/public -type d -exec chmod 755 {} \;
RUN find /var/www/html/public -type f -exec chmod 644 {} \;
RUN chown -R www-data:www-data /var/www/html

EXPOSE 80

CMD ["apache2-foreground"]