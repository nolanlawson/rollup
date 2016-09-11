import { forOwn } from '../../utils/object.js';
import Scope from './Scope.js';

export default class ModuleScope extends Scope {
	constructor ( module ) {
		super({
			isBlockScope: false,
			isLexicalBoundary: true,
			isModuleScope: true,
			parent: module.bundle.scope
		});

		this.module = module;
	}

	deshadow ( names ) {
		names = new Map( names );

		forOwn( this.module.imports, specifier => {
			if ( specifier.module.isExternal ) return;

			console.log('specifier.name', specifier.name);
			debugger;

			var allNames = [];
			specifier.module.getExports().forEach( name => {
				allNames.push(name)
			});
			if ( specifier.name !== '*' ) {
				const declaration = specifier.module.traceExport( specifier.name );
				const name = declaration.getName( true );
				console.log('name', name, 'specifier.name', specifier.name)
				if ( name !== specifier.name ) {
					console.log('3name', declaration.getName( true ));
					allNames.push(declaration.getName( true ))
				}
			}
			new Set(allNames).forEach(name => {
				names.set( name, true );
			})
		});

		console.log('2names', Array.from(names.keys()));
		super.deshadow( names );
	}

	findDeclaration ( name ) {
		if ( this.declarations[ name ] ) {
			return this.declarations[ name ];
		}

		return this.module.trace( name ) || this.parent.findDeclaration( name );
	}

	findLexicalBoundary () {
		return this;
	}
}
