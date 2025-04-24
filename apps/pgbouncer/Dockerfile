FROM --platform=linux/amd64 ubuntu:22.04

# Install PgBouncer and create user
RUN apt-get update && \
    apt-get install -y curl ca-certificates gnupg lsb-release && \
    curl https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor -o /usr/share/keyrings/postgresql-keyring.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/postgresql-keyring.gpg] http://apt.postgresql.org/pub/repos/apt jammy-pgdg main" | tee /etc/apt/sources.list.d/pgdg.list && \
    apt-get update && \
    apt-get install -y pgbouncer wget postgresql-client-16 && \
    useradd -r -s /bin/false map && \
    apt-get clean

# Create required directories
RUN mkdir -p /var/log/pgbouncer /var/run/pgbouncer

# Install Doppler CLI
RUN wget -q -t3 'https://packages.doppler.com/public/cli/gpg.DE2A7741A397C129.key' -O - | gpg --dearmor -o /usr/share/keyrings/doppler-cli-archive-keyring.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/doppler-cli-archive-keyring.gpg] https://packages.doppler.com/public/cli/deb/debian any-version main" | tee /etc/apt/sources.list.d/doppler-cli.list && \
    apt-get update && \
    apt-get install -y doppler

# Copy configuration files
COPY pgbouncer.ini /etc/pgbouncer/
COPY userlist.txt /etc/pgbouncer/

# Set permissions
RUN chown -R map:map /var/log/pgbouncer /var/run/pgbouncer /etc/pgbouncer && \
    chmod 640 /etc/pgbouncer/userlist.txt && \
    chmod 644 /etc/pgbouncer/pgbouncer.ini

# Expose the PgBouncer port
EXPOSE 6432

# Set environment variables
ENV PORT=6432

# Build arg for Doppler token
ARG DOPPLER_TOKEN
ENV DOPPLER_TOKEN=${DOPPLER_TOKEN}

# Run PgBouncer with Doppler
USER map
CMD ["pgbouncer", "-u", "map", "/etc/pgbouncer/pgbouncer.ini"] 