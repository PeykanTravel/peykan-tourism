FROM nginx:alpine

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy SSL certificates
COPY ssl/ /etc/nginx/ssl/

# Create log directories
RUN mkdir -p /var/log/nginx

# Expose ports for HTTP and HTTPS
EXPOSE 80 443

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider https://localhost/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 