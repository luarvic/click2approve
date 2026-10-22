import CardHeading from "@/shared/components/papers/CardHeading";

interface ApprovalStepTitleProps {
  sequence: number;
}

const ApprovalStepTitle: React.FC<ApprovalStepTitleProps> = ({ sequence }) => (
  <CardHeading>Step {sequence}</CardHeading>
);

export default ApprovalStepTitle;
