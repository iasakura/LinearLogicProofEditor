export type ProofTree = {
  children: ProofTree[];
  sequent: string;
  rule: string;
};
