import DOMPurify from 'dompurify';

import type { ToastId, ToastVariant, RawToast } from './types';

/**
 * @internal
 */
export class Toast {
	public readonly id: ToastId;
	public readonly content: string;
	public readonly variant: ToastVariant;
	public readonly duration: number;
	public readonly dismissable: boolean;

	public constructor( input: RawToast ) {
		this.id = input.id ?? Toast.makeId();
		this.content = Toast.sanitize( input.content );
		this.variant = input.variant ?? 'default';
		this.duration = input.duration ?? 5000;
		this.dismissable = input.dismissable ?? true;
	}

	private static sanitize( content: unknown ): string {
		return typeof content === 'string' ? DOMPurify.sanitize( content ) : '';
	}

	private static makeId(): ToastId {
		if (
			typeof crypto !== 'undefined' &&
			typeof crypto.randomUUID === 'function'
		) {
			return crypto.randomUUID();
		}
		// TODO check if uuid lib is less expensive.
		return `toast-${ Date.now() }-${ Math.floor( Math.random() * 1e9 ) }`;
	}
}
