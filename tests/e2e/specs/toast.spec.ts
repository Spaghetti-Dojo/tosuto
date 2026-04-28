import { test, expect } from '@playwright/test';

const SELECTORS = {
	container: '.wp-tosuto',
	item: '.wp-tosuto__item',
	content: '.wp-tosuto__content',
	dismiss: '.wp-tosuto__dismiss',
};

test.describe( 'PHP-queued toasts', () => {
	test( 'is visible after page load with correct content and variant', async ( {
		page,
	} ) => {
		await page.goto( '/?tosuto-test=php' );
		await page.waitForSelector( SELECTORS.item );
		const item = page.locator( SELECTORS.item ).first();
		await expect( item ).toBeVisible();
		await expect( item.locator( SELECTORS.content ) ).toContainText(
			'PHP Toast'
		);
		await expect( item ).toHaveAttribute( 'data-variant', 'default' );
	} );
} );

test.describe( 'JS-created toasts', () => {
	test( 'actions.add() creates toast in DOM with correct content and variant', async ( {
		page,
	} ) => {
		await page.goto( '/?tosuto-test=js' );
		const item = page.locator( SELECTORS.item ).first();
		await expect( item ).toBeVisible();
		await expect( item.locator( SELECTORS.content ) ).toContainText(
			'JS Toast Content'
		);
		await expect( item ).toHaveAttribute( 'data-variant', 'success' );
	} );
} );

test.describe( 'Toast stacking', () => {
	test( 'multiple toasts stack vertically', async ( { page } ) => {
		await page.goto( '/?tosuto-test=php-multiple' );
		const items = page.locator( SELECTORS.item );
		await expect( items ).toHaveCount( 3 );

		const boxes = await items.evaluateAll( ( els ) =>
			els.map( ( el ) => el.getBoundingClientRect().top )
		);

		for ( let i = 1; i < boxes.length; i++ ) {
			expect( boxes[ i ] ).not.toBe( boxes[ i - 1 ] );
		}
	} );
} );

test.describe( 'Dismiss', () => {
	test( 'dismiss button removes only the clicked toast', async ( {
		page,
	} ) => {
		await page.goto( '/?tosuto-test=php-multiple' );
		const items = page.locator( SELECTORS.item );
		await expect( items ).toHaveCount( 3 );

		const secondContent = await items
			.nth( 1 )
			.locator( SELECTORS.content )
			.textContent();

		await items.nth( 1 ).locator( SELECTORS.dismiss ).click();

		await expect( items ).toHaveCount( 2 );

		const remainingTexts = await items
			.locator( SELECTORS.content )
			.allTextContents();
		expect( remainingTexts ).not.toContain( secondContent );
	} );
} );

test.describe( 'Auto-dismiss', () => {
	test( 'toast auto-dismisses after duration', async ( { page } ) => {
		await page.goto( '/?tosuto-test=php-short-duration' );
		const item = page.locator( SELECTORS.item );
		await expect( item ).toBeVisible();
		await expect( item ).toHaveCount( 0, { timeout: 3000 } );
	} );
} );

test.describe( 'Hover pause/resume', () => {
	test( 'hover pauses auto-dismiss, mouseleave resumes it', async ( {
		page,
	} ) => {
		await page.goto( '/?tosuto-test=php-short-duration' );
		const item = page.locator( SELECTORS.item ).first();
		await expect( item ).toBeVisible();

		await item.hover();

		// Wait beyond the original duration while hovering
		await page.waitForTimeout( 1500 );
		await expect( item ).toBeVisible();

		// Move mouse away — toast should dismiss
		await page.mouse.move( 0, 0 );
		await expect( item ).toHaveCount( 0, { timeout: 3000 } );
	} );
} );

test.describe( 'Variant classes', () => {
	test( 'all variant classes render correctly', async ( { page } ) => {
		await page.goto( '/?tosuto-test=php-all-variants' );
		const items = page.locator( SELECTORS.item );
		await expect( items ).toHaveCount( 5 );

		const variants = await items.evaluateAll( ( els ) =>
			els.map( ( el ) => el.getAttribute( 'data-variant' ) )
		);

		expect( variants ).toContain( 'default' );
		expect( variants ).toContain( 'success' );
		expect( variants ).toContain( 'error' );
		expect( variants ).toContain( 'warning' );
		expect( variants ).toContain( 'info' );
	} );
} );
