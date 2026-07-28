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
  onClose: (currentDelegationId?: number) => void;
  onDelete: (delegationId: number) => Promise<boolean>;
  onSubmit: (
    payload: ApprovalDelegationUpsert,
    delegationId?: number,
  ) => Promise<ApprovalDelegation | null>;
}

const employeeSelectionDefault = 0;

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
  const tenantId = stores.tenantStore.currentTenantId;
  const delegationsPath = tenantId
    ? Routes.tenantPath(tenantId, "/delegations")
    : "/";
  const selectableEmployees = employees.filter(
    (employee) =>
      employee.status === EmployeeStatus.Active ||
      employee.id === delegatorEmployeeId ||
      employee.id === delegateEmployeeId,
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
      delegation?.delegatorEmployeeId ?? employeeSelectionDefault,
    );
    setDelegateEmployeeId(
      delegation?.delegateEmployeeId ?? employeeSelectionDefault,
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
        delegateEmployeeId,
        delegatorEmployeeId,
      },
      delegation?.id,
    );

    if (savedDelegation) {
      onClose(savedDelegation.id);
    }
  };

  return (
    <>
      <PageBreadcrumbs
        items={[
          {
            label: "Delegations",
            state: delegation ? { currentDelegationId: delegation.id } : undefined,
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
          onChange={(event) => setDelegatorEmployeeId(Number(event.target.value))}
          onBlur={() => setDelegatorTouched(true)}
          error={delegatorHasError}
          helperText={delegatorHasError ? "Select an employee." : undefined}
          fullWidth
          required
          disabled={!isNew && !canEdit}
        >
          <MenuItem value={employeeSelectionDefault}>Select employee</MenuItem>
          {selectableEmployees.map((employee) => (
            <MenuItem key={employee.id} value={employee.id}>
              {employee.displayName}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Delegate"
          value={delegateEmployeeId}
          onChange={(event) => setDelegateEmployeeId(Number(event.target.value))}
          onBlur={() => setDelegateTouched(true)}
          error={delegateHasError}
          helperText={delegateHasError ? delegateHelperText : undefined}
          fullWidth
          required
          disabled={!isNew && !canEdit}
        >
          <MenuItem value={employeeSelectionDefault}>Select delegate</MenuItem>
          {selectableEmployees.map((employee) => (
            <MenuItem key={employee.id} value={employee.id}>
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
        <Button variant="outlined" onClick={() => onClose(delegation?.id)}>
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
          onDelete={() => onDelete(delegation.id)}
        />
      )}
    </>
  );
};

const getEmployeeName = (employees: Employee[], employeeId: number) =>
  employees.find((employee) => employee.id === employeeId)?.displayName ??
  "unknown employee";

export default DelegationDialog;
