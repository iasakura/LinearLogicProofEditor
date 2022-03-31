import React from 'react';
import { Loc } from '../derivation-tree';
import { Sequent } from '../models/linearLogic/Formula';
import { parseFormula } from '../models/linearLogic/parser';
import { DispatcherContext } from '../reducer/Reducer';

const WhyNotInputForm = (props: { loc: Loc<Sequent>; pos: number }) => {
  const dispatch = React.useContext(DispatcherContext);
  const [rule, setRule] = React.useState('dereliction');

  const handleSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    if (rule === 'dereliction') {
      dispatch({
        name: 'proofAction',
        action: { name: 'applyDereliction', loc: props.loc, pos: props.pos },
      });
    } else if (rule === 'contraction') {
      dispatch({
        name: 'proofAction',
        action: { name: 'applyContraction', loc: props.loc, pos: props.pos },
      });
    } else if (rule === 'weakening') {
      dispatch({
        name: 'proofAction',
        action: { name: 'applyWeakening', loc: props.loc, pos: props.pos },
      });
    }
  };

  const handleChange = (ev: React.ChangeEvent<HTMLSelectElement>) => {
    setRule(ev.target.value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Which rule?
        <select value={rule} onChange={handleChange}>
          <option value="dereliction">Dereliction</option>
          <option value="contraction">Contraction</option>
          <option value="weakening">Weakening</option>
        </select>
      </label>
      <input type="submit" value="apply"></input>
    </form>
  );
};

const PlusInputForm = (props: { loc: Loc<Sequent>; pos: number }) => {
  const dispatch = React.useContext(DispatcherContext);
  const [rule, setRule] = React.useState('plus1');

  const handleSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    if (rule === 'plus1') {
      dispatch({
        name: 'proofAction',
        action: { name: 'applyPlus1', loc: props.loc, pos: props.pos },
      });
    } else if (rule === 'plus2') {
      dispatch({
        name: 'proofAction',
        action: { name: 'applyPlus2', loc: props.loc, pos: props.pos },
      });
    }
  };

  const handleChange = (ev: React.ChangeEvent<HTMLSelectElement>) => {
    setRule(ev.target.value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Which rule?
        <select value={rule} onChange={handleChange}>
          <option value="plus1">Plus1</option>
          <option value="plus2">Plus2</option>
        </select>
      </label>
      <input type="submit" value="apply"></input>
    </form>
  );
};

const CutInputForm = (props: { loc: Loc<Sequent>; pos: number }) => {
  const dispatch = React.useContext(DispatcherContext);

  const [cutFormula, setCutFormula] = React.useState('');

  const handleSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const formula = parseFormula(cutFormula);
    dispatch({
      name: 'proofAction',
      action: {
        name: 'applyCut',
        loc: props.loc,
        pos: props.pos,
        cutFormula: formula,
      },
    });
  };

  const handleChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setCutFormula(ev.target.value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Name:
        <input type="text" value={cutFormula} onChange={handleChange} />
      </label>
      <input type="submit" value="Submit" />
    </form>
  );
};

export const DetailInputForm = (props: {
  type: 'whyNot' | 'plus' | 'cut';
  loc: Loc<Sequent>;
  pos: number;
}) => {
  if (props.type === 'whyNot') {
    return <WhyNotInputForm loc={props.loc} pos={props.pos} />;
  } else if (props.type === 'plus') {
    return <PlusInputForm loc={props.loc} pos={props.pos} />;
  } else if (props.type === 'cut') {
    return <CutInputForm loc={props.loc} pos={props.pos} />;
  } else {
    // never
    return props.type;
  }
};
