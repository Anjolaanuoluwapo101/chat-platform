# Use PHP 7.4 Apache image as base
FROM php:7.4-apache

# Install required extensions
RUN docker-php-ext-install pdo pdo_mysql

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Install Node.js
# 1. Install system dependencies required for Composer and PHP extensions
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libzip-dev \
    curl \
    && curl -sL https://deb.nodesource.com/setup_16.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*
# Install Redis extension
RUN pecl install redis && docker-php-ext-enable redis

# Set working directory
WORKDIR /var/www/html

# -------------------------------------------
# OPTIMIZATION 1: Backend Caching
# -------------------------------------------
# Copy ONLY dependency files first
COPY composer.json composer.lock ./

# Install dependencies (This layer is now cached unless composer.json changes)
RUN composer install --no-scripts --no-autoloader

# NOW copy the actual backend code
# (Changing your PHP code won't trigger a re-install of composer packages)
COPY app/ ./app/
COPY public/ ./public/

# Finish composer setup
RUN composer dump-autoload --optimize

# -------------------------------------------
# OPTIMIZATION 2: Frontend Caching
# -------------------------------------------
# Create directory for frontend
WORKDIR /var/www/html/frontendAnony

# Copy ONLY package.json and package-lock.json first
# Note: We assume package*.json matches both files
COPY frontendAnony/package*.json ./

# Install Node dependencies (This layer is now cached unless package.json changes)
RUN npm install

# NOW copy the rest of the frontend source code
COPY frontendAnony/ .

# Build frontend
RUN npm run build

# Copy built frontend files to public directory
# (Adjusted path: we are currently in /html/frontendAnony, so we go up one level)
RUN cp -r dist/* ../public/

# -------------------------------------------
# Final Server Configuration
# -------------------------------------------
# Switch back to main directory
WORKDIR /var/www/html

# Create index.html if it doesn't exist
RUN touch public/index.html

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# Update Apache configuration to allow .htaccess overrides
RUN sed -i 's/AllowOverride None/AllowOverride All/g' /etc/apache2/apache2.conf

# Set permissions
RUN chown -R www-data:www-data /var/www/html
RUN chmod -R 755 /var/www/html

# Expose port 80
EXPOSE 80

# Start Apache in foreground
CMD ["apache2-foreground"]