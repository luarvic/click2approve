import { ExpandMore } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Container,
  Grid,
  Link,
  Typography,
} from "@mui/material";
import { observer } from "mobx-react-lite";

const HelpPage = () => {
  return (
    <Container>
      <Typography component="h1" variant="h5">
        Welcome to click2approve — free open-source document approval system
      </Typography>
      <Box sx={{ mt: 2 }}>
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            aria-controls="panel1-content"
            id="panel1-header"
          >
            Sending documents for approval
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                1. Sign in.
              </Grid>
              <Grid item xs={12}>
                2. Open Files tab and upload documents.
              </Grid>
              <Grid item xs={12}>
                <Box
                  component="img"
                  sx={{
                    maxWidth: "100%",
                    height: "auto",
                  }}
                  alt="Open Files tab and upload documents."
                  src="/images/upload-files.png"
                />
              </Grid>
              <Grid item xs={12}>
                3. Select documents and click SEND.
              </Grid>
              <Grid item xs={12}>
                <Box
                  component="img"
                  sx={{
                    maxWidth: "100%",
                    height: "auto",
                  }}
                  alt="Select documents and click SEND."
                  src="/images/send-files-1.png"
                />
              </Grid>
              <Grid item xs={12}>
                4. Enter the email addresses of the approvers and click SUBMIT.
              </Grid>
              <Grid item xs={12}>
                <Box
                  component="img"
                  sx={{
                    maxWidth: "100%",
                    height: "auto",
                  }}
                  alt="Enter the email addresses of the approvers and click SUBMIT."
                  src="/images/send-files-2.png"
                />
              </Grid>
              <Grid item xs={12}>
                5. Open Sent tab to manage approval requests.
              </Grid>
              <Grid item xs={12}>
                <Box
                  component="img"
                  sx={{
                    maxWidth: "100%",
                    height: "auto",
                  }}
                  alt="Open Sent tab to manage approval requests."
                  src="/images/manage-sent-requests-1.png"
                />
              </Grid>
              <Grid item xs={12}>
                6. Click Track to see the approval request details.
              </Grid>
              <Grid item xs={12}>
                <Box
                  component="img"
                  sx={{
                    maxWidth: "100%",
                    height: "auto",
                  }}
                  alt="Click Track to see the approval request details."
                  src="/images/manage-sent-requests-2.png"
                />
              </Grid>
              <Grid item xs={12}>
                7. Once the request is processed by the approver, its status
                will change and you will receive an email notification.
              </Grid>
              <Grid item xs={12}>
                <Box
                  component="img"
                  sx={{
                    maxWidth: "100%",
                    height: "auto",
                  }}
                  alt="Once the request is processed by the approver, its status will change and you will receive an email notification."
                  src="/images/manage-sent-requests-3.png"
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            aria-controls="panel2-content"
            id="panel2-header"
          >
            Approving documents
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                1. Sign in.
              </Grid>
              <Grid item xs={12}>
                2. Open Inbox tab and click Review.
              </Grid>
              <Grid item xs={12}>
                <Box
                  component="img"
                  sx={{
                    maxWidth: "100%",
                    height: "auto",
                  }}
                  alt="Open Inbox tab and click Review."
                  src="/images/review-requests-1.png"
                />
              </Grid>
              <Grid item xs={12}>
                3. Click filename to download the file. Choose Approve or
                Reject. Click SUBMIT.
              </Grid>
              <Grid item xs={12}>
                <Box
                  component="img"
                  sx={{
                    maxWidth: "100%",
                    height: "auto",
                  }}
                  alt="Click filename to download the file. Choose Approve or Reject. Click SUBMIT."
                  src="/images/review-requests-2.png"
                />
              </Grid>
              <Grid item xs={12}>
                4. Open Archive tab to manage processed requests.
              </Grid>
              <Grid item xs={12}>
                <Box
                  component="img"
                  sx={{
                    maxWidth: "100%",
                    height: "auto",
                  }}
                  alt="Open Archive tab to manage processed requests."
                  src="/images/managed-archive-requests-1.png"
                />
              </Grid>
              <Grid item xs={12}>
                5. Click Review to see the processed request details.
                <Box
                  component="img"
                  sx={{
                    maxWidth: "100%",
                    height: "auto",
                  }}
                  alt="Click Review to see the processed request details."
                  src="/images/managed-archive-requests-2.png"
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            aria-controls="panel3-content"
            id="panel3-header"
          >
            Contributing
          </AccordionSummary>
          <AccordionDetails>
            click2approve is an open-source software. You are welcome to
            contribute to the project at{" "}
            <Link href="https://github.com/luarvic/click2approve">
              github.com/luarvic/click2approve
            </Link>
            .
          </AccordionDetails>
        </Accordion>
      </Box>
    </Container>
  );
};

export default observer(HelpPage);
