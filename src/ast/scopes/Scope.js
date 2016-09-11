import { blank, keys } from '../../utils/object.js';
import { UNKNOWN } from '../values.js';

class Parameter {
	constructor ( name ) {
		this.name = name;

		this.isParam = true;
		this.activated = true;
	}

	activate () {
		// noop
	}

	addReference () {
		// noop?
	}

	gatherPossibleValues ( values ) {
		values.add( UNKNOWN ); // TODO populate this at call time
	}

	getName () {
		return this.name;
	}
}

export default class Scope {
	constructor ( options ) {
		options = options || {};

		this.parent = options.parent;
		this.isBlockScope = !!options.isBlockScope;
		this.isLexicalBoundary = !!options.isLexicalBoundary;
		this.isModuleScope = !!options.isModuleScope;

		this.children = [];
		if ( this.parent ) this.parent.children.push( this );

		this.declarations = blank();

		if ( this.isLexicalBoundary && !this.isModuleScope ) {
			this.declarations.arguments = new Parameter( 'arguments' );
		}
	}

	addDeclaration ( name, declaration, isVar, isParam ) {
		console.log('5addDecl', name);
		if (name === 'innerFunc') {
			console.trace()
		}
		if ( isVar && this.isBlockScope ) {
			this.parent.addDeclaration( name, declaration, isVar, isParam );
		} else {
			const existingDeclaration = this.declarations[ name ];

			if ( existingDeclaration && existingDeclaration.duplicates ) {
				// TODO warn/throw on duplicates?
				existingDeclaration.duplicates.push( declaration );
			} else {
				this.declarations[ name ] = isParam ? new Parameter( name ) : declaration;
			}
		}
	}

	contains ( name ) {
		return !!this.declarations[ name ] ||
		       ( this.parent ? this.parent.contains( name ) : false );
	}

	deshadow ( names ) {
		debugger;
		console.trace()
		console.log('4names', Array.from(names.keys()))
		console.log('4deshadowing', Array.from(keys( this.declarations )));
		keys( this.declarations ).forEach( key => {
			console.log('deshadowing', key);
			if (key === 'problematicFunc') {
				console.trace()
			}
			const declaration = this.declarations[ key ];

			// we can disregard exports.foo etc
			if ( declaration.exportName && declaration.isReassigned ) {
				console.log('disregarding because reassigned')
				return;
			}

			const name = declaration.getName( true );
			let deshadowed = name;

			let i = 1;

			console.log('beginning to deshadow')
			console.log('names', Array.from(names.keys()))
			while ( names.has( deshadowed ) ) {
				deshadowed = `${name}$$${i++}`;
				console.log('deshadowed', deshadowed);
			}

			console.log('final name deshadowed is', deshadowed);

			declaration.name = deshadowed;
		});

		this.children.forEach( scope => scope.deshadow( names ) );
	}

	findDeclaration ( name ) {
		return this.declarations[ name ] ||
		       ( this.parent && this.parent.findDeclaration( name ) );
	}

	findLexicalBoundary () {
		return this.isLexicalBoundary ? this : this.parent.findLexicalBoundary();
	}
}
