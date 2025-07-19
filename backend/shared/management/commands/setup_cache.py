"""
Django management command to setup cache table.
"""

from django.core.management.base import BaseCommand
from django.core.cache import cache
from django.db import connection


class Command(BaseCommand):
    help = 'Setup cache table for database caching'

    def handle(self, *args, **options):
        self.stdout.write('Setting up cache table...')
        
        try:
            # Create cache table
            with connection.cursor() as cursor:
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS cache_table (
                        cache_key varchar(255) NOT NULL PRIMARY KEY,
                        value text NOT NULL,
                        expires timestamp with time zone NOT NULL
                    );
                """)
                
                # Create index for better performance
                cursor.execute("""
                    CREATE INDEX IF NOT EXISTS cache_table_expires_idx 
                    ON cache_table (expires);
                """)
            
            # Test cache
            cache.set('test_key', 'test_value', 60)
            test_value = cache.get('test_key')
            
            if test_value == 'test_value':
                self.stdout.write(
                    self.style.SUCCESS('Cache table created and working successfully!')
                )
            else:
                self.stdout.write(
                    self.style.WARNING('Cache table created but test failed.')
                )
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Failed to setup cache table: {e}')
            ) 