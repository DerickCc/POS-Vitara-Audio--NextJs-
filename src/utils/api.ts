export function toQueryString(obj: any): string {
  return "?".concat(
    Object.keys(obj)
      .map((e) => obj[e] ? `${encodeURIComponent(e)}=${encodeURIComponent(obj[e])}` : '')
      .filter((x) => x !== null && x !== "" && x !== undefined)
      .join("&")
  );
}

export async function apiFetch(url: string, options: any, responseType: 'json' | 'blob' = 'json') {
  const finalOptions = {
    method: options.method,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  };

  const response = await fetch(url, finalOptions);

  let finalResponse = null;

  if (responseType === 'json') {
    finalResponse = await response.json();
  } else if (responseType === 'blob') {
    finalResponse = await response.blob();
  }
  
  // Check if response status is not OK
  if (!response.ok) {
    throw new Error(finalResponse.message || 'Terjadi Error');
  }

  return finalResponse;
}