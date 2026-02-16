import FiltersBar from "./components/FiltersBar";
import SectionTabs from "./components/SectionTabs";
import ChartCard from "./components/ChartCard";
import CardContainer from "./components/CardContainer";
import { demographicsMock, employmentDeptData,workerDeptData,
  genderDeptData,  } from "./mockDemograpics";
import BarChartCard from "./components/BarChartCard";
import DeptBarChartCard from "./components/DeptBarChartCard";

export default function HeadcountDemographicsPage() {
  return (
    <div
      style={{
        padding: 20,
        background: "#f6f7fb",
        fontFamily: "Inter, sans-serif",
        minHeight: "100vh",
      }}
    >
      <SectionTabs />

      <h2 style={{ marginTop: 20 }}>
        Headcount Distribution by Demographics
      </h2>

      <FiltersBar />

      <CardContainer>
        <ChartCard
          title="Gender"
          data={demographicsMock.gender}
          total={demographicsMock.total}
        />

        <ChartCard
          title="Employment Type"
          data={demographicsMock.employmentType}
          total={demographicsMock.total}
        />

        <ChartCard
          title="Worker Type"
          data={demographicsMock.workerType}
          total={demographicsMock.total}
        />

        <ChartCard
          title="Nationality"
          data={demographicsMock.nationality}
          total={demographicsMock.total}
        />
        </CardContainer>


        <CardContainer>
        <BarChartCard
          title="Age of Employees (in Years)"
          data={demographicsMock.ageGroups}
          xKey="group"
          bars={[
            { key: "female", color: "#5b8def" },
            { key: "male", color: "#c06dbf" },
          ]}
        />
        <BarChartCard
          title="Years in Organisation"
          data={demographicsMock.experience}
          xKey="range"
          bars={[{ key: "value", color: "#e3b52e" }]}
        />
      </CardContainer>
      <DeptBarChartCard
  title="Headcount by Worker Type Across Department"
  data={workerDeptData}
  xKey="dept"
  bars={[
    { key: "contingent", color: "#7b6ed6" },
    { key: "permanent", color: "#e26a47" },
  ]}
/>

<DeptBarChartCard
  title="Headcount by Gender Across Department"
  data={genderDeptData}
  xKey="dept"
  bars={[
    { key: "female", color: "#5b8def" },
    { key: "male", color: "#c06dbf" },
  ]}
/>

<DeptBarChartCard
  title="Headcount by Employment Type Across Department"
  data={employmentDeptData}
  xKey="dept"
  bars={[
    { key: "full", color: "#59b3b8" },
  ]}
/>

    </div>
  );
}
