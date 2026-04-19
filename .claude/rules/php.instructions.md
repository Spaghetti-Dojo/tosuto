---
paths:
  - "sources/server/**/*.php"
---

# PHP Server Instructions

The following instructions are applicable to all php files in this repository.

## Requirements

- PHP 8.4 or higher
- WordPress 6.9 or higher

## Core Architectural Principles

### SOLID Principles

Apply SOLID principles within WordPress conventions:

1. **Single Responsibility Principle (SRP)**
   - Each PHP class/function should have one clear purpose
   - Separate concerns: data handling, rendering, business logic.

2. **Open/Closed Principle (OCP)**
   - Use WordPress hooks (actions/filters) for extensibility
   - Design functions to be extended via filters without modification
   - Leverage WordPress plugin API for customization points

3. **Liskov Substitution Principle (LSP)**
   - Ensure child classes/implementations can replace parents
   - Maintain consistent interfaces when extending WordPress classes
   - Type hints should be honored by implementations

4. **Interface Segregation Principle (ISP)**
   - Keep interfaces focused and minimal
   - Don't force classes to depend on unused methods
   - Use PHP interfaces for contract definitions

5. **Dependency Inversion Principle (DIP)**
   - Depend on abstractions, not concrete implementations
   - Use dependency injection where appropriate
   - Pass dependencies via constructors or factory patterns

### Additional Principles

- **Separation of Concerns (SoC)**: Keep presentation, business logic, and data access separate
- **DRY (Don't Repeat Yourself)**: Extract reusable code into utilities
- **YAGNI (You Aren't Gonna Need It)**: Implement only what's currently needed
- **Composition over Inheritance**: Favor composition and traits over deep inheritance hierarchies

## PHP QA Agent

**Always delegate PHP quality fix tasks to the `php-qa-fixer` agent.** This applies whenever:
- `composer cs` or `composer analysis` report errors or warnings
- PHP files have been written or modified and need QA verification
- The user asks to fix, clean up, or check PHP code quality

Do not handle PHP QA fixes inline — always use the agent.

## Code Comments

- Avoid redundant comments that state the obvious
- Focus comments on explaining the "why" and "how" rather than the "what"
- Don't use docblocks for functions and methods where parameters types and return types are already clear from type hints

## Variable Usage

- **Avoid redundant intermediary variables.** When a value is being built up through conditions, reuse the same variable throughout rather than introducing a separate "raw" or "initial" variable. A variable like `$raw_version` that only exists to seed `$version` adds noise without clarity — just mutate `$version` directly.

  ```php
  // Bad
  $raw_version = get_option('theme_version', false);
  $version = $raw_version ?: wp_get_theme()->get('Version');

  // Good
  $version = get_option('theme_version', false);
  $version = $version ?: wp_get_theme()->get('Version');
  ```

- **Extract private methods for multi-step value construction.** When building a value through several conditions or transformations inside a method, extract the logic into a dedicated `private` method. This keeps the calling method readable and gives the construction logic a named home.

  ```php
  // Instead of inline conditional chains in a public method:
  public function assetVersion(): string
  {
      $version = get_option('theme_version', false);
      $version = $version ?: wp_get_theme()->get('Version');
      $version = is_string($version) ? $version : '0.0.0';
      return $version;
  }

  // Prefer:
  public function assetVersion(): string
  {
      return $this->resolveVersion();
  }

  private function resolveVersion(): string
  {
      $version = get_option('theme_version', false);
      $version = $version ?: wp_get_theme()->get('Version');
      return is_string($version) ? $version : '0.0.0';
  }
  ```

## Namespaces

When importing classes from other namespaces, group the declaration together. See following code
sample:

```php
<?php

use Vendor\Package\{
	ClassA,
	ClassB,
	Namespace\SubNamespace\ClassC
};
```
