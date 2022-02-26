import assert from 'assert';

export type Derivation<T> = {
  children: Derivation<T>[] | 'open';
  content: T;
  rule: string;
};

type DerivationCtx<T> =
  | {
      name: 'node';
      pos: number;
      left: Derivation<T>[];
      right: Derivation<T>[];
      parent: DerivationCtx<T>;
      content: T;
      rule: string;
    }
  | {
      name: 'top';
    };

export class Loc<T> {
  constructor(private ctx: DerivationCtx<T>, public tree: Derivation<T>) {}

  public go(pos: number): Loc<T> {
    assert(this.tree.children !== 'open');
    assert(this.tree.children.length > pos);

    const left = this.tree.children.slice(0, pos);
    const right = this.tree.children.slice(pos + 1);
    const tree = this.tree.children[pos];

    return new Loc<T>(
      {
        name: 'node',
        pos,
        left: left,
        right: right,
        parent: this.ctx,
        content: this.tree.content,
        rule: this.tree.rule,
      },
      tree
    );
  }

  public up(): Loc<T> {
    assert(this.ctx.name !== 'top');

    return new Loc<T>(this.ctx.parent, {
      children: this.ctx.left.concat(this.tree, ...this.ctx.right),
      content: this.ctx.content,
      rule: this.ctx.rule,
    });
  }

  public replaceWith(new_: Derivation<T>): Derivation<T> {
    if (this.ctx.name === 'top') {
      return new_;
    } else {
      const new_tree = {
        children: this.ctx.left.concat(new_, ...this.ctx.right),
        content: this.ctx.content,
        rule: this.ctx.rule,
      };
      return this.up().replaceWith(new_tree);
    }
  }
}

export function makeTop<T>(tree: Derivation<T>): Loc<T> {
  return new Loc<T>({ name: 'top' }, tree);
}
