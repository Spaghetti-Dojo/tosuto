export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

export type ToastId = string;

export type RawToast = Partial<
	Readonly< {
		id?: ToastId;
		content: string;
		variant?: ToastVariant;
		duration?: number;
		dismissable?: boolean;
	} >
>;
