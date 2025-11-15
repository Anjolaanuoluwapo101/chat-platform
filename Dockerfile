# # Use PHP 8.2 (Required for modern Composer dependencies)
# FROM php:8.2-apache

# # Install required extensions
# RUN docker-php-ext-install pdo pdo_mysql

# # Install Composer
# COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# # Install Node.js v20 (Required for Vite/React)
# RUN apt-get update && apt-get install -y curl
# RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash -

# # Install system dependencies
# RUN apt-get update && apt-get install -y \
#     apt-utils \
#     nodejs \
#     git \
#     zip \
#     unzip \
#     libpng-dev \
#     libonig-dev \
#     libxml2-dev \
#     libzip-dev \
#     libjpeg-dev \
#     libfreetype6-dev \
#     libpq-dev \
#     sqlite3 \
#     libsqlite3-dev \
#     && docker-php-ext-configure gd --with-freetype --with-jpeg \
#     && docker-php-ext-install pdo pdo_mysql mbstring exif pcntl bcmath gd zip \
#     && rm -rf /var/lib/apt/lists/*

# RUN pecl install redis && docker-php-ext-enable redis

# # --- FIX START: Configure Apache to serve from /public ---
# ENV APACHE_DOCUMENT_ROOT /var/www/html/public

# RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
# RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# # ADD THIS LINE:
# # This finds "AllowOverride None" in the site config (which now points to your public dir)
# # and changes it to "AllowOverride All", enabling your .htaccess file.
# RUN sed -ri -e 's!AllowOverride None!AllowOverride All!g' /etc/apache2/sites-available/*.conf
# # --- FIX END ---

# # RUN echo "<Directory /var/www/html/public>" >> /etc/apache2/apache2.conf && \
# #     echo "    AllowOverride All" >> /etc/apache2/apache2.conf && \
# #     echo "</Directory>" >> /etc/apache2/apache2.conf

# WORKDIR /var/www/html

# # Backend Build
# COPY composer.json composer.lock ./
# RUN composer install --no-dev --optimize-autoloader --no-scripts --ignore-platform-reqs

# COPY app/ ./app/
# COPY public/ ./public/
# COPY public/.htaccess ./public/.htaccess

# RUN composer dump-autoload --optimize --no-scripts 

# # Frontend Build
# WORKDIR /var/www/html/frontendModified
# COPY frontendModified/package*.json ./
# RUN npm install
# COPY frontendModified/ .
# RUN npm run build
# RUN cp -r dist/* ../public/

# # Final Config
# WORKDIR /var/www/html

# # Enable mod_rewrite
# RUN a2enmod rewrite

# # Permissions
# RUN chown -R www-data:www-data /var/www/html
# RUN chmod -R 755 /var/www/html

# RUN find /var/www/html/public -type d -exec chmod 755 {} \;
# RUN find /var/www/html/public -type f -exec chmod 644 {} \;
# RUN chown -R www-data:www-data /var/www/html

# EXPOSE 80

# CMD ["apache2-foreground"]



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

# --- START: Apache Configuration Fix ---
# This is a much cleaner way than using sed.
# We create our own config file that does exactly what we want.

# 1. Enable mod_rewrite
RUN a2enmod rewrite

# 2. Disable the default site
RUN a2dissite 000-default.conf

# 3. Create a new, custom config file
RUN echo '<VirtualHost *:80>\n' \
    '    ServerName localhost\n' \
    '    DocumentRoot /var/www/html/public\n\n' \
    '    <Directory /var/www/html/public>\n' \
    '        DirectoryIndex index.php\n' \
    '        AllowOverride All\n' \
    '        Require all granted\n' \
    '    </Directory>\n\n' \
    '    ErrorLog ${APACHE_LOG_DIR}/error.log\n' \
    '    CustomLog ${APACHE_LOG_DIR}/access.log combined\n' \
    '</VirtualHost>' > /etc/apache2/sites-available/my-app.conf

# 4. Enable our new site
RUN a2ensite my-app.conf
# --- END: Apache Configuration Fix ---

WORKDIR /var/www/html

# Backend Build
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-scripts --ignore-platform-reqs

COPY app/ ./app/
COPY public/ ./public/
# Explicitly copy .htaccess just in case
COPY public/.htaccess ./public/.htaccess

RUN composer dump-autoload --optimize --no-scripts 

# Frontend Build
WORKDIR /var/www/html/frontendModified
COPY frontendModified/package*.json ./
RUN npm install
COPY frontendModified/ .
RUN npm run build
RUN cp -r dist/* ../public/

# Final Config
WORKDIR /var/www/html

# Permissions (Note: `public` permissions are set *before* files are moved in)
# We run chown/chmod again on the final structure.
RUN chown -R www-data:www-data /var/www/html
RUN chmod -R 755 /var/www/html

# Re-apply specific permissions to public after frontend build
RUN find /var/www/html/public -type d -exec chmod 755 {} \;
RUN find /var/www/html/public -type f -exec chmod 644 {} \;
RUN chown -R www-data:www-data /var/www/html/public

EXPOSE 80

CMD ["apache2-foreground"]