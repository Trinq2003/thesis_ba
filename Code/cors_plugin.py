from tutor import hooks

hooks.Filters.ENV_PATCHES.add_items([
    # Add http://localhost:3000 to LMS CORS whitelist and CSRF trusted origins
    ("openedx-lms-common-settings", 'CORS_ORIGIN_WHITELIST.append("http://localhost:3000")'),
    ("openedx-lms-common-settings", 'CSRF_TRUSTED_ORIGINS.append("http://localhost:3000")'),

    # Add http://localhost:3000 to CMS CORS whitelist and CSRF trusted origins
    ("openedx-cms-common-settings", 'CORS_ORIGIN_WHITELIST.append("http://localhost:3000")'),
    ("openedx-cms-common-settings", 'CSRF_TRUSTED_ORIGINS.append("http://localhost:3000")'),
])