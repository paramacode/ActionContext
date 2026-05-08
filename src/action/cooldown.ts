const _expires = new Map<string, number>();

export function set(tag: string, seconds: number): void {
	if (seconds <= 0) {
		_expires.delete(tag);
		return;
	}
	_expires.set(tag, os.clock() + seconds);
}

export function clear(tag: string): void {
	_expires.delete(tag);
}

export function clearAll(): void {
	_expires.clear();
}

export function remaining(tag: string | undefined): number {
	if (tag === undefined) return 0;

	const expiresAt = _expires.get(tag);
	if (expiresAt === undefined) return 0;

	const left = expiresAt - os.clock();
	return left > 0 ? left : 0;
}
