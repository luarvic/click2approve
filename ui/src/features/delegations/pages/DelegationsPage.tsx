import { stores } from "@/app/rootStore";
import {
  createApprovalDelegation,
  deleteApprovalDelegation,
  listApprovalDelegations,
  updateApprovalDelegation,
} from "@/features/delegations/api/approvalDelegationsApi";
import { ApprovalDelegation } from "@/features/delegations/models/approvalDelegation";
import { EmployeeStatus } from "@/features/employees/models/employee";
import { Dialogs, Pages, StackSpacing } from "@/shared/constants/constants";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { Add, DeleteOutline, Save } from "@mui/icons-material";
import {
  Button,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

type EditableDelegation = ApprovalDelegation & { key: string };

const delegationRowsSx: SxProps<Theme> = {
  ...Dialogs.contentStackSx,
};

const delegationRowSx: SxProps<Theme> = {
  alignItems: { md: "center" },
};

const delegationFieldSx: SxProps<Theme> = {
  flex: 1,
  minWidth: 220,
};

const actionButtonsSx: SxProps<Theme> = {
  alignSelf: { xs: "flex-start", md: "center" },
};

const createEmptyDelegation = (): EditableDelegation => ({
  createdAt: "",
  delegateEmployeeId: 0,
  delegatorEmployeeId: 0,
  id: 0,
  key: crypto.randomUUID(),
  tenantId: stores.tenantStore.currentTenantId ?? 0,
});

const toEditable = (delegation: ApprovalDelegation): EditableDelegation => ({
  ...delegation,
  key: `delegation-${delegation.id}`,
});

const DelegationsPage = () => {
  usePageTitle("Delegations");
  const tenantId = stores.tenantStore.currentTenantId;
  const [delegations, setDelegations] = useState<EditableDelegation[]>([]);

  const activeEmployees = useMemo(
    () =>
      stores.employeeStore.employees.filter(
        (employee) => employee.status === EmployeeStatus.Active,
      ),
    [stores.employeeStore.employees],
  );

  useEffect(() => {
    if (!tenantId) {
      return;
    }

    void Promise.all([
      stores.employeeStore.load(tenantId),
      listApprovalDelegations(tenantId).then((items) =>
        setDelegations(items.map(toEditable)),
      ),
    ]);
  }, [tenantId]);

  const updateDelegation = (
    key: string,
    updater: (delegation: EditableDelegation) => EditableDelegation,
  ) => {
    setDelegations((current) =>
      current.map((delegation) =>
        delegation.key === key ? updater(delegation) : delegation,
      ),
    );
  };

  const saveDelegation = async (delegation: EditableDelegation) => {
    if (!tenantId) {
      return;
    }
    if (!delegation.delegatorEmployeeId || !delegation.delegateEmployeeId) {
      toast.error("Select both employees.");
      return;
    }
    if (delegation.delegatorEmployeeId === delegation.delegateEmployeeId) {
      toast.error("Delegator and delegate must be different employees.");
      return;
    }

    const payload = {
      delegateEmployeeId: delegation.delegateEmployeeId,
      delegatorEmployeeId: delegation.delegatorEmployeeId,
    };
    const saved = delegation.id
      ? await updateApprovalDelegation(tenantId, delegation.id, payload)
      : await createApprovalDelegation(tenantId, payload);
    if (!saved) {
      return;
    }

    updateDelegation(delegation.key, () => toEditable(saved));
    toast.success("Delegation saved.");
  };

  const removeDelegation = async (delegation: EditableDelegation) => {
    if (!tenantId) {
      return;
    }
    if (!delegation.id) {
      setDelegations((current) =>
        current.filter((item) => item.key !== delegation.key),
      );
      return;
    }

    if (await deleteApprovalDelegation(tenantId, delegation.id)) {
      setDelegations((current) =>
        current.filter((item) => item.key !== delegation.key),
      );
      toast.success("Delegation deleted.");
    }
  };

  return (
    <>
      <Typography component="h1" variant="h5" sx={Pages.titleSx}>
        Delegations
      </Typography>
      <Stack spacing={Dialogs.formStackSpacing} sx={delegationRowsSx}>
        {delegations.map((delegation) => (
          <Stack
            key={delegation.key}
            direction={{ xs: "column", md: "row" }}
            spacing={StackSpacing.default}
            sx={delegationRowSx}
          >
            <TextField
              select
              label="Employee"
              value={delegation.delegatorEmployeeId}
              sx={delegationFieldSx}
              onChange={(event) =>
                updateDelegation(delegation.key, (current) => ({
                  ...current,
                  delegatorEmployeeId: Number(event.target.value),
                }))
              }
            >
              <MenuItem value={0}>Select employee</MenuItem>
              {activeEmployees.map((employee) => (
                <MenuItem key={employee.id} value={employee.id}>
                  {employee.displayName}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Delegate"
              value={delegation.delegateEmployeeId}
              sx={delegationFieldSx}
              onChange={(event) =>
                updateDelegation(delegation.key, (current) => ({
                  ...current,
                  delegateEmployeeId: Number(event.target.value),
                }))
              }
            >
              <MenuItem value={0}>Select delegate</MenuItem>
              {activeEmployees.map((employee) => (
                <MenuItem key={employee.id} value={employee.id}>
                  {employee.displayName}
                </MenuItem>
              ))}
            </TextField>
            <Stack direction="row" spacing={StackSpacing.tight} sx={actionButtonsSx}>
              <Tooltip title="Save delegation">
                <IconButton
                  color="primary"
                  aria-label="Save delegation"
                  onClick={() => saveDelegation(delegation)}
                >
                  <Save />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete delegation">
                <IconButton
                  color="error"
                  aria-label="Delete delegation"
                  onClick={() => removeDelegation(delegation)}
                >
                  <DeleteOutline />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        ))}
        <Button
          startIcon={<Add />}
          variant="outlined"
          onClick={() =>
            setDelegations((current) => [...current, createEmptyDelegation()])
          }
        >
          Add delegation
        </Button>
      </Stack>
    </>
  );
};

export default observer(DelegationsPage);
