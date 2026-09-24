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
import { useFormValidation } from "@/shared/hooks/useFormValidation";
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
  const [deleteDialogIsOpen, setDeleteDialogIsOpen] = useState(false);
  const saveLoader = ActionLoaders.delegations.save(delegation?.globalId);
  const saveAction = useAsyncAction(saveLoader);
  const isNew = delegation === null;
  const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
  const delegationsPath = tenantGlobalId ? Routes.tenantPath(tenantGlobalId, "/delegations") : "/";
  const validation = useFormValidation(
    { delegatorEmployeeId, delegateEmployeeId },
    {
      delegatorEmployeeId: (value) => (!value ? "Select an employee." : undefined),
      delegateEmployeeId: (value) =>
        !value
          ? "Select a delegate."
          : value === delegatorEmployeeId
            ? "Delegator and delegate must be different employees."
            : undefined,
    },
    { delegatorEmployeeId: "DelegatorEmployeeGlobalId", delegateEmployeeId: "DelegateEmployeeGlobalId" },
  );
  const saveIsLoading = saveAction.isRunning || stores.commonStore.isActionLoading(saveLoader);
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
  }, [delegation]);

  const handleSubmit = async () => {
    if (!validation.validate()) {
      return;
    }

    await validation.run(() =>
      saveAction.run(async () => {
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
      }),
    );
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
          SelectProps={{
            renderValue: (selected) => renderEmployeeValue(selected as string),
          }}
          onChange={(event) => setDelegatorEmployeeId(event.target.value)}
          {...validation.field("delegatorEmployeeId")}
          fullWidth
          required
          disabled={fieldsDisabled}
        >
          <MenuItem value={employeeSelectionDefault}>Select employee</MenuItem>
          {employees.map((employee) => (
            <MenuItem
              key={employee.globalId}
              value={employee.globalId}
              disabled={employee.status === EmployeeStatus.Disabled}
            >
              <EmployeeDisplayName employee={employee} />
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Delegate"
          value={delegateEmployeeId}
          SelectProps={{
            renderValue: (selected) => renderEmployeeValue(selected as string),
          }}
          onChange={(event) => setDelegateEmployeeId(event.target.value)}
          {...validation.field("delegateEmployeeId")}
          fullWidth
          required
          disabled={fieldsDisabled}
        >
          <MenuItem value={employeeSelectionDefault}>Select delegate</MenuItem>
          {employees.map((employee) => (
            <MenuItem
              key={employee.globalId}
              value={employee.globalId}
              disabled={employee.status === EmployeeStatus.Disabled}
            >
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
