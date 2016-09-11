import Node from '../Node.js';
import isReference from '../utils/isReference.js';

export default class Identifier extends Node {
	bind ( scope ) {
		this.scope = scope;
		if ( isReference( this, this.parent ) ) {
			this.declaration = scope.findDeclaration( this.name );
			this.declaration.addReference( this ); // TODO necessary?
		}
	}

	gatherPossibleValues ( values ) {
		if ( isReference( this, this.parent ) ) {
			values.add( this );
		}
	}

	render ( code, es ) {
		if ( this.declaration ) {
			const name = this.declaration.getName( es );
			if ( name !== this.name ) {

				var existingDeclaration = this.scope.findDeclaration(name);
				if (existingDeclaration && existingDeclaration.type === 'FunctionDeclaration') {
				}

				console.log('declars?', this.scope.findDeclaration('funcThatWillCauseIssues'));
				console.log('declars?', this.scope.findDeclaration(name));

				console.log('name', name, 'this.name', this.name);
				console.log('start', this.start, 'end', this.end, 'name', name);
				console.log('code before', code.toString());
				code.overwrite( this.start, this.end, name, true );
				console.log('code after', code.toString());

				// special case
				if ( this.parent.type === 'Property' && this.parent.shorthand ) {
					code.insertLeft( this.start, `${this.name}: ` );
				}
			}
		}
	}

	run () {
		if ( this.declaration ) this.declaration.activate();
	}
}
