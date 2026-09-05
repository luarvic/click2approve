import { stores } from "@/app/rootStore";
import { ApprovalDelegation, ApprovalDelegationUpsert } from "@/features/delegations/models/approvalDelegation";
import EmployeeDisplayName from "@/features/employees/components/EmployeeDisplayName";
import { Employee, EmployeeStatus } from "@/features/employees/models/employee";
import MainActionButton from "@/shared/components/buttons/MainActionButton";
import DeleteConfirmationDialog from "@/shared/components/dialogs/DeleteConfirmationDialog";
import { Forms } from "@/shared/components/dialogs/formStyles";
import CloseOnEscape from "@/shared/components/navigation/CloseOnEscape";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { Routes } from "@/shared/routing/routes";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import { getEmployeeDisplayName } from "@/shared/utils/displayNameHelpers";
import { Button, MenuItem, Stack, TextField } from "@mui/material";
import { useEffect, useState } from "react";

interface DelegationDialogProps {
  canEdit: boolean;
  delegation: ApprovalDelegation | null;
  employees: Employee[];
  onClose: (currentDelegationGlobalId?: string) => void;
  onDelete: (delegationGlobalId: string) => Promise<boolean>;
  onSubmit: (payload: ApprovalDelegationUpsert, delegationGlobalId?: string) => Promise<ApprovalDelegation | null>;
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
  const [delegatorEmployeeId, setDelegatorEmployeeId] = useState(employeeSelectionDefault);
  const [delegateEmployeeId, setDelegateEmployeeId] = useState(employeeSelectionDefault);
  const [delegatorTouched, setDelegatorTouched] = useState(false);
  const [delegateTouched, setDelegateTouched] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [deleteDialogIsOpen, setDeleteDialogIsOpen] = useState(false);
  const saveLoader = ActionLoaders.delegations.save(delegation?.globalId);
  const saveAction = useAsyncAction(saveLoader);
  const isNew = delegation === null;
  const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
  const delegationsPath = tenantGlobalId ? Routes.tenantPath(tenantGlobalId, "/delegations") : "/";
  const selectionsAreMissing = !delegatorEmployeeId || !delegateEmployeeId;
  const employeesMatch =
    delegatorEmployeeId !== employeeSelectionDefault &&
    delegateEmployeeId !== employeeSelectionDefault &&
    delegatorEmployeeId === delegateEmployeeId;
  const delegatorHasError = (delegatorTouched || submitAttempted) && !delegatorEmployeeId;
  const delegateHasError = ((delegateTouched || submitAttempted) && !delegateEmployeeId) || employeesMatch;
  const delegateHelperText = employeesMatch
    ? "Delegator and delegate must be different employees."
    : "Select a delegate.";
  const saveIsLoading = saveAction.isRunning || stores.commonStore.isActionLoading(saveLoader);
  const activeEmployees = employees.filter(
    (employee) => employee.status === undefined || employee.status === EmployeeStatus.Active,
  );
  const fieldsDisabled = !isNew && !canEdit;
  const delegationName = `${getEmployeeName(
    employees,
    delegatorEmployeeId,
  )} to ${getEmployeeName(employees, delegateEmployeeId)}`;
  const renderEmployeeValue = (employeeGlobalId: string) => {
    const employee = employees.find((item) => item.globalId === employeeGlobalId);
    return employee ? (
      <EmployeeDisplayName disabled={fieldsDisabled} employee={employee} />
    ) : (
      getEmployeeName(employees, employeeGlobalId)
    );
  };

  useEffect(() => {
    setDelegatorEmployeeId(delegation?.delegatorEmployeeGlobalId ?? employeeSelectionDefault);
    setDelegateEmployeeId(delegation?.delegateEmployeeGlobalId ?? employeeSelectionDefault);
    setDelegatorTouched(false);
    setDelegateTouched(false);
    setSubmitAttempted(false);
  }, [delegation]);

  const handleSubmit = async () => {
    setSubmitAttempted(true);
    if (selectionsAreMissing || employeesMatch) {
      return;
    }

    await saveAction.run(async () => {
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
    });
  };

  return (
    <CloseOnEscape onClose={() => onClose(delegation?.globalId)}>
      <PageBreadcrumbs
        items={[
          {
            label: "Delegations",
            state: delegation ? { currentDelegationGlobalId: delegation.globalId } : undefined,
            to: delegationsPath,
          },
          {
            label: delegation ? getEmployeeName(employees, delegation.delegatorEmployeeGlobalId) : "New delegation",
          },
        ]}
      />
      <Stack spacing={Forms.formStackSpacing}>
        <TextField
          select
          label="Employee"
          value={delegatorEmployeeId}
          SelectProps={{ renderValue: (selected) => renderEmployeeValue(selected as string) }}
          onChange={(event) => setDelegatorEmployeeId(event.target.value)}
          onBlur={() => setDelegatorTouched(true)}
          error={delegatorHasError}
          helperText={delegatorHasError ? "Select an employee." : undefined}
          fullWidth
          required
          disabled={fieldsDisabled}
        >
          <MenuItem value={employeeSelectionDefault}>Select employee</MenuItem>
          {activeEmployees.map((employee) => (
            <MenuItem key={employee.globalId} value={employee.globalId}>
              <EmployeeDisplayName employee={employee} />
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Delegate"
          value={delegateEmployeeId}
          SelectProps={{ renderValue: (selected) => renderEmployeeValue(selected as string) }}
          onChange={(event) => setDelegateEmployeeId(event.target.value)}
          onBlur={() => setDelegateTouched(true)}
          error={delegateHasError}
          helperText={delegateHasError ? delegateHelperText : undefined}
          fullWidth
          required
          disabled={fieldsDisabled}
        >
          <MenuItem value={employeeSelectionDefault}>Select delegate</MenuItem>
          {activeEmployees.map((employee) => (
            <MenuItem key={employee.globalId} value={employee.globalId}>
              <EmployeeDisplayName employee={employee} />
            </MenuItem>
          ))}
        </TextField>
      </Stack>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={Forms.actionSpacing} sx={Forms.addActionSx}>
        <Button variant="outlined" onClick={() => onClose(delegation?.globalId)}>
          Cancel
        </Button>
        {!isNew && canEdit && (
          <Button color="error" variant="outlined" onClick={() => setDeleteDialogIsOpen(true)}>
            Delete
          </Button>
        )}
        {(isNew || canEdit) && (
          <MainActionButton loading={saveIsLoading} onClick={handleSubmit}>
            Save
          </MainActionButton>
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
    </CloseOnEscape>
  );
};

const getEmployeeName = (employees: Employee[], employeeGlobalId: string) => {
  const employee = employees.find((item) => item.globalId === employeeGlobalId);
  return getEmployeeDisplayName(employee);
};

export default DelegationDialog;
