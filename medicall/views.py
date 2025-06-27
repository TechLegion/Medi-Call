import requests
import json
from django.http import JsonResponse
from django.views.decorators.http import require_GET
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
@require_GET
def currency_rate(request):
    from_currency = request.GET.get('from', 'USD').upper()
    to_currency = request.GET.get('to', 'USD').upper()
    rate = 1
    source = ''
    
    # Fallback rates for common currencies (approximate as of 2024)
    fallback_rates = {
        'NGN': 1500,  # Nigerian Naira
        'GBP': 0.8,   # British Pound
        'CAD': 1.35,  # Canadian Dollar
        'KES': 150,   # Kenyan Shilling
        'INR': 83,    # Indian Rupee
        'EUR': 0.92,  # Euro
        'JPY': 150,   # Japanese Yen
        'AUD': 1.52,  # Australian Dollar
        'CHF': 0.88,  # Swiss Franc
        'CNY': 7.2,   # Chinese Yuan
    }
    
    try:
        # Try multiple free APIs that don't require keys
        apis_to_try = [
            {
                'url': 'https://api.exchangerate.host/latest',
                'params': {'base': from_currency},
                'extract_rate': lambda data: data.get('rates', {}).get(to_currency, 1),
                'name': 'exchangerate.host'
            },
            {
                'url': 'https://open.er-api.com/v6/latest',
                'params': {'base': from_currency},
                'extract_rate': lambda data: data.get('rates', {}).get(to_currency, 1),
                'name': 'open.er-api.com'
            },
            {
                'url': 'https://api.frankfurter.app/latest',
                'params': {'from': from_currency, 'to': to_currency},
                'extract_rate': lambda data: data.get('rates', {}).get(to_currency, 1),
                'name': 'frankfurter.app'
            }
        ]
        
        for api in apis_to_try:
            try:
                r = requests.get(api['url'], params=api['params'], timeout=5)
                if r.status_code == 200:
                    data = r.json()
                    rate = api['extract_rate'](data)
                    if rate and rate != 1:  # Valid rate found
                        source = api['name']
                        break
            except Exception as e:
                print(f"API {api['name']} failed: {str(e)}")
                continue
        
        # If no API worked, use fallback
        if source == '':
            rate = fallback_rates.get(to_currency, 1)
            source = 'fallback'
                
    except Exception as e:
        rate = fallback_rates.get(to_currency, 1)
        return JsonResponse({
            'rate': rate, 
            'from': from_currency, 
            'to': to_currency, 
            'source': 'fallback', 
            'error': str(e)
        }, status=200)
    
    return JsonResponse({
        'rate': rate, 
        'from': from_currency, 
        'to': to_currency, 
        'source': source
    }) 