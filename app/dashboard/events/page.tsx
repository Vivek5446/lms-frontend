"use client";
import { Box } from "@chakra-ui/react";
import { useState } from "react";
import { observer } from "mobx-react-lite";
import TableList from "./TableList";
import DashPageHeader from "../../component/common/DashPageHeader/DashPageHeader";
import DashPageTitle from "../../component/common/DashPageTitle/DashPageTitle";
import FormModel from "../../component/common/FormModel/FormModel";
import stores from "../../store/stores";
import AddTestimonial from "./component/AddForm";
import EditTestimonial from "./component/EditForm";

const Page = observer(() => {
  const {
    EventStore: { setOpenTestimonialDrawer, getEvent },
  } = stores;
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);
  const [openEvent, setOpenEvent] = useState(false);

  return (
    <Box>
      <Box display="none">
        <DashPageHeader
          btnAction={() => setOpenTestimonialDrawer()}
          breadcrumb={[]}
        />
      </Box>
      <DashPageTitle
        title="Our Events"
        subTitle="What Other peoples thinks about your Organisations"
      />
      <Box>
        <TableList
          onAdd={() => setOpenEvent(true)}
          onEdit={(testimonial: any) => {
            setSelectedTestimonial(testimonial);
            setIsEditing(true);
          }}
          getData={() => getEvent({page : currentPage})}
          setCurrentPage={setCurrentPage}
          currentPage={currentPage}
        />
      </Box>
      {/* CREATE THE NEW tESTIMONIAL */}
      <FormModel
        open={openEvent}
        close={() => setOpenEvent(false)}
        loading={false}
        title="Add Events"
        isCentered={true}
      >
        <AddTestimonial close={() => setOpenEvent(false)} />
      </FormModel>
      {isEditing && selectedTestimonial && (
        <FormModel
          open={isEditing}
          close={() => setIsEditing(false)}
          title="Edit Events"
          isCentered={true}
        >
          <EditTestimonial
            testimonial={selectedTestimonial}
            close={() => setIsEditing(false)}
            getData={() => getEvent({page : currentPage})}
          />
        </FormModel>
      )}
    </Box>
  );
});

export default Page;
