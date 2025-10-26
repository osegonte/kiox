import os
import httpx
from typing import Any, Dict, List, Optional

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

class SupabaseClient:
    def __init__(self):
        self.base_url = f"{SUPABASE_URL}/rest/v1"
        self.headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }
    
    def table(self, table_name: str):
        return TableQuery(self.base_url, self.headers, table_name)

class TableQuery:
    def __init__(self, base_url: str, headers: Dict, table_name: str):
        self.base_url = base_url
        self.headers = headers
        self.table_name = table_name
        self.query_params = []
        self.order_params = []
    
    def select(self, columns: str = "*"):
        self.columns = columns
        return self
    
    def eq(self, column: str, value: Any):
        self.query_params.append(f"{column}=eq.{value}")
        return self
    
    def in_(self, column: str, values: List[Any]):
        values_str = ",".join([str(v) for v in values])
        self.query_params.append(f"{column}=in.({values_str})")
        return self
    
    def ilike(self, column: str, pattern: str):
        self.query_params.append(f"{column}=ilike.{pattern}")
        return self
    
    def order(self, column: str, desc: bool = False):
        order = f"{column}.desc" if desc else column
        self.order_params.append(order)
        return self
    
    def execute(self):
        url = f"{self.base_url}/{self.table_name}"
        params = "&".join(self.query_params)
        if self.order_params:
            params += f"&order={','.join(self.order_params)}"
        if params:
            url += f"?{params}"
        
        response = httpx.get(url, headers=self.headers)
        response.raise_for_status()
        return Result(response.json())
    
    def insert(self, data: Dict):
        url = f"{self.base_url}/{self.table_name}"
        response = httpx.post(url, headers=self.headers, json=data)
        response.raise_for_status()
        return Result(response.json())
    
    def update(self, data: Dict):
        url = f"{self.base_url}/{self.table_name}"
        params = "&".join(self.query_params)
        if params:
            url += f"?{params}"
        
        response = httpx.patch(url, headers=self.headers, json=data)
        response.raise_for_status()
        return Result(response.json())

class Result:
    def __init__(self, data):
        self.data = data

def get_supabase():
    return SupabaseClient()
