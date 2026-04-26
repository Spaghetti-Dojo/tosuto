/* eslint-disable max-classes-per-file -- Null Object pattern: Timer and its null counterpart are intrinsically paired and splitting them creates a circular dependency (Timer.start/pause/resume construct NullTimer, which extends Timer). */
type Handle = ReturnType< typeof setTimeout >;

/**
 * @internal
 */
export class Timer {
	readonly #handle: Handle | null;
	readonly #remaining: number;
	readonly #startedAt: number;

	public constructor(
		handle: Handle | null,
		remaining: number,
		startedAt: number
	) {
		this.#handle = handle;
		this.#remaining = remaining;
		this.#startedAt = startedAt;
	}

	public static start( duration: number, onExpire: () => void ): Timer {
		if ( ! Number.isFinite( duration ) || duration <= 0 ) {
			return new NullTimer();
		}
		return new Timer(
			setTimeout( onExpire, duration ),
			duration,
			Date.now()
		);
	}

	public pause(): Timer {
		if ( this.#handle === null ) {
			return new NullTimer();
		}
		clearTimeout( this.#handle );
		const elapsed = Date.now() - this.#startedAt;
		return new Timer(
			null,
			Math.max( 0, this.#remaining - elapsed ),
			this.#startedAt
		);
	}

	public resume( onExpire: () => void ): Timer {
		if ( this.#handle !== null ) {
			return new NullTimer();
		}
		if ( this.#remaining <= 0 ) {
			onExpire();
			return new NullTimer();
		}
		return new Timer(
			setTimeout( onExpire, this.#remaining ),
			this.#remaining,
			Date.now()
		);
	}

	public clear(): void {
		if ( this.#handle !== null ) {
			clearTimeout( this.#handle );
		}
	}
}

export class NullTimer extends Timer {
	public constructor() {
		super( null, 0, 0 );
	}

	public override pause(): Timer {
		return this;
	}

	public override resume(): Timer {
		return this;
	}

	public override clear(): void {
		// intentional no-op
	}
}
