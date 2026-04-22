import {
	store,
	getContext,
	getElement,
	getServerState,
} from '@wordpress/interactivity';

import type { ToastId, RawToast } from './types';
import { TimerCollection } from './value-objects/timer-collection';
import { Toast } from './toast';

let timers = new TimerCollection();

const { state, actions } = store( 'wp-tosuto', {
	state: {
		toasts: new Map< ToastId, Toast >(),
	},
	actions: {
		add( content: string, options: RawToast = {} ): ToastId {
			const toast = new Toast( { content, ...options } );
			state.toasts = new Map( state.toasts ).set( toast.id, toast );
			timers = timers.schedule( toast.id, toast.duration, () => {
				actions.remove( toast.id );
			} );
			return toast.id;
		},
		remove( id: ToastId ): void {
			if ( ! state.toasts.has( id ) ) {
				return;
			}
			const next = new Map( state.toasts );
			next.delete( id );
			state.toasts = next;
			timers = timers.clear( id );
		},
		pauseTimer( id: ToastId ): void {
			timers = timers.pause( id );
		},
		resumeTimer( id: ToastId ): void {
			timers = timers.resume( id, () => {
				actions.remove( id );
			} );
		},
	},
	callbacks: {
		init(): void {
			const server = getServerState< { toasts?: Array< RawToast > } >();
			for ( const raw of server.toasts ?? [] ) {
				actions.add( raw.content ?? '', raw );
			}
		},
		renderContent(): void {
			const { ref } = getElement();
			const { toastId } = getContext< { toastId: ToastId } >();
			const toast = state.toasts.get( toastId );
			if ( ref ) {
				ref.innerHTML = toast?.content ?? '';
			}
		},
	},
} );
