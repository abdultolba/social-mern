export const parseImageUrl = url => {
	if(url.includes('http')) return url
    if(url.includes('assets')) return url
    
    const base = import.meta.env.VITE_ASSET_BASE || import.meta.env.VITE_API_BASE || window.location.origin
	const path = url.startsWith('/') ? url.slice(1) : url
	return `${base}/${path}`
}
