import { stores } from "@/app/rootStore";
import {
  ApprovalDelegation,
  ApprovalDelegationUpsert,
} from "@/features/delegations/models/approvalDelegation";
import { Employee, EmployeeStatus } from "@/features/employees/models/employee";
import DeleteConfirmationDialog from "@/shared/components/dialogs/DeleteConfirmationDialog";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import { Dialogs, Routes } from "@/shared/constants/constants";
import {
  Button,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";

interface DelegationDialogProps {
  canEdit: boolean;
  delegation: ApprovalDelegation | null;
  employees: Employee[];
  onClose: (currentDelegationGlobalId?: string) => void;
  onDelete: (delegationGlobalId: string) => Promise<boolean>;
  onSubmit: (
    payload: ApprovalDelegationUpsert,
    delegationGlobalId?: string,
  ) => Promise<ApprovalDelegation | null>;
}

const employeeSelectionDefault = "";

const DelegationDialog: React.FC<DelegationDialogProps> = ({
  canEdit,
  delegation,
  employees,
  onClose,
  onDelete,
  onSubmit,
}) => {
  const [delegatorEmployeeId, setDelegatorEmployeeId] = useState(
    employeeSelectionDefault,
  );
  const [delegateEmployeeId, setDelegateEmployeeId] = useState(
    employeeSelectionDefault,
  );
  const [delegatorTouched, setDelegatorTouched] = useState(false);
  const [delegateTouched, setDelegateTouched] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [deleteDialogIsOpen, setDeleteDialogIsOpen] = useState(false);
  const isNew = delegation === null;
  const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
  const delegationsPath = tenantGlobalId
    ? Routes.tenantPath(tenantGlobalId, "/delegations")
    : "/";
  const selectableEmployees = employees.filter(
    (employee) =>
      employee.status === EmployeeStatus.Active ||
      employee.globalId === delegatorEmployeeId ||
      employee.globalId === delegateEmployeeId,
  );
  const selectionsAreMissing =
    !delegatorEmployeeId || !delegateEmployeeId;
  const employeesMatch =
    delegatorEmployeeId !== employeeSelectionDefault &&
    delegateEmployeeId !== employeeSelectionDefault &&
    delegatorEmployeeId === delegateEmployeeId;
  const delegatorHasError =
    (delegatorTouched || submitAttempted) && !delegatorEmployeeId;
  const delegateHasError =
    ((delegateTouched || submitAttempted) && !delegateEmployeeId) ||
    employeesMatch;
  const delegateHelperText = employeesMatch
    ? "Delegator and delegate must be different employees."
    : "Select a delegate.";
  const delegationName = `${getEmployeeName(
    employees,
    delegatorEmployeeId,
  )} to ${getEmployeeName(employees, delegateEmployeeId)}`;

  useEffect(() => {
    setDelegatorEmployeeId(
      delegation?.delegatorEmployeeGlobalId ?? employeeSelectionDefault,
    );
    setDelegateEmployeeId(
      delegation?.delegateEmployeeGlobalId ?? employeeSelectionDefault,
    );
    setDelegatorTouched(false);
    setDelegateTouched(false);
    setSubmitAttempted(false);
  }, [delegation]);

  const handleSubmit = async () => {
    setSubmitAttempted(true);
    if (selectionsAreMissing || employeesMatch) {
      return;
    }

    const savedDelegation = await onSubmit(
      {
        delegateEmployeeGlobalId: delegateEmployeeId,
        delegatorEmployeeGlobalId: delegatorEmployeeId,
      },
      delegation?.globalId,
    );

    if (savedDelegation) {
      onClose(savedDelegation.globalId);
    }
  };

  return (
    <>
      <PageBreadcrumbs
        items={[
          {
            label: "Delegations",
            state: delegation ? { currentDelegationGlobalId: delegation.globalId } : undefined,
            to: delegationsPath,
          },
          { label: isNew ? "New delegation" : "Delegation" },
        ]}
      />
      <Stack spacing={Dialogs.formStackSpacing}>
        <TextField
          select
          label="Employee"
          value={delegatorEmployeeId}
          onChange={(event) => setDelegatorEmployeeId(event.target.value)}
          onBlur={() => setDelegatorTouched(true)}
          error={delegatorHasError}
          helperText={delegatorHasError ? "Select an employee." : undefined}
          fullWidth
          required
          disabled={!isNew && !canEdit}
        >
          <MenuItem value={employeeSelectionDefault}>Select employee</MenuItem>
          {selectableEmployees.map((employee) => (
            <MenuItem key={employee.globalId} value={employee.globalId}>
              {employee.displayName}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Delegate"
          value={delegateEmployeeId}
          onChange={(event) => setDelegateEmployeeId(event.target.value)}
          onBlur={() => setDelegateTouched(true)}
          error={delegateHasError}
          helperText={delegateHasError ? delegateHelperText : undefined}
          fullWidth
          required
          disabled={!isNew && !canEdit}
        >
          <MenuItem value={employeeSelectionDefault}>Select delegate</MenuItem>
          {selectableEmployees.map((employee) => (
            <MenuItem key={employee.globalId} value={employee.globalId}>
              {employee.displayName}
            </MenuItem>
          ))}
        </TextField>
      </Stack>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={Dialogs.stepHeaderSpacing}
        sx={Dialogs.addStepButtonSx}
      >
        <Button variant="outlined" onClick={() => onClose(delegation?.globalId)}>
          Cancel
        </Button>
        {!isNew && canEdit && (
          <Button
            color="error"
            variant="outlined"
            onClick={() => setDeleteDialogIsOpen(true)}
          >
            Delete
          </Button>
        )}
        {(isNew || canEdit) && (
          <Button variant="outlined" onClick={handleSubmit}>
            Save
          </Button>
        )}
      </Stack>
      {delegation && (
        <DeleteConfirmationDialog
          entityName={delegationName}
          open={deleteDialogIsOpen}
          title="Delete delegation"
          onClose={() => setDeleteDialogIsOpen(false)}
          onDelete={() => onDelete(delegation.globalId)}
        />
      )}
    </>
  );
};

const getEmployeeName = (employees: Employee[], employeeGlobalId: string) =>
  employees.find((employee) => employee.globalId === employeeGlobalId)?.displayName ??
  "unknown employee";

export default DelegationDialog;
