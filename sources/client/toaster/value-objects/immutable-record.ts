export class ImmutableRecord< T > {
	readonly #map: Readonly< Record< string, T > >;

	public constructor( map: Readonly< Record< string, T > > = {} ) {
		this.#map = map;
	}

	public get( key: string ): T | undefined;
	public get( key: string, fallback: T ): T;
	public get( key: string, fallback?: T ): T | undefined {
		return this.#map[ key ] ?? fallback;
	}

	public set( key: string, value: T ): ImmutableRecord< T > {
		return new ImmutableRecord( { ...this.#map, [ key ]: value } );
	}

	public delete( key: string ): ImmutableRecord< T > {
		const { [ key ]: _removed, ...rest } = this.#map;
		return new ImmutableRecord( rest );
	}
}
