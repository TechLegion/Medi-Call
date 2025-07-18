"""
URL configuration for medicall project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from medicall.views import currency_rate
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

schema_view = get_schema_view(
    openapi.Info(
        title="MediCall API",
        default_version='v1',
        description="API for connecting hospitals with medical professionals",
        terms_of_service="https://www.medicall.com/terms/",
        contact=openapi.Contact(email="contact@medicall.com"),
        license=openapi.License(name="MIT License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

@csrf_exempt
def health_check(request):
    return JsonResponse({"status": "healthy"}, status=200)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API Documentation
    path('swagger<format>/', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    
    # API Endpoints
    path('api/auth/', include('accounts.urls')),
    path('api/shifts/', include('shifts.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/currency-rate/', currency_rate, name='currency_rate'),
    path('api/health/', health_check, name='health_check'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
