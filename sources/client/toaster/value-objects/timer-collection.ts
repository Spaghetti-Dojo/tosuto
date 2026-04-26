import { ImmutableRecord } from './immutable-record';
import { Timer, NullTimer } from './timer';

/**
 * @internal
 */
export class TimerCollection {
	readonly #nullTimer = new NullTimer();

	public constructor(
		readonly timers: Readonly<
			ImmutableRecord< Timer >
		> = new ImmutableRecord()
	) {}

	public schedule(
		key: string,
		duration: number,
		onExpire: () => void
	): TimerCollection {
		const timer = Timer.start( duration, onExpire );
		return new TimerCollection( this.timers.set( key, timer ) );
	}

	public pause( key: string ): TimerCollection {
		const paused = this.timers.get( key, this.#nullTimer ).pause();
		return new TimerCollection( this.timers.set( key, paused ) );
	}

	public resume( key: string, onExpire: () => void ): TimerCollection {
		const resumed = this.timers
			.get( key, this.#nullTimer )
			.resume( onExpire );
		return new TimerCollection( this.timers.set( key, resumed ) );
	}

	public clear( key: string ): TimerCollection {
		this.timers.get( key, this.#nullTimer ).clear();
		return new TimerCollection( this.timers.delete( key ) );
	}
}
