# Use PHP 7.4 Apache image as base
FROM php:7.4-apache

# Install required extensions
RUN docker-php-ext-install pdo pdo_mysql

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Install Node.js for building frontend
RUN apt-get update && apt-get install -y \
    curl \
    && curl -sL https://deb.nodesource.com/setup_16.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Redis extension
RUN pecl install redis && docker-php-ext-enable redis

# Set working directory
WORKDIR /var/www/html

# Copy backend files
COPY app/ ./app/
COPY public/ ./public/
COPY composer.json composer.lock ./

# Install PHP dependencies
RUN composer install --no-scripts --no-autoloader
RUN composer dump-autoload --optimize

# Copy frontend files
COPY frontendAnony/ ./frontendAnony/

# Build frontend
WORKDIR /var/www/html/frontendAnony
RUN npm install
RUN npm run build

# Copy built frontend files to public directory
RUN cp -r dist/* ../public/

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