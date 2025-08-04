import React from "react";
import BlogLayout from "@/components/shared/BlogLayout";
import { blogPageData } from "@/constant/blogData";

const page = () => {
  return (
    <BlogLayout
      pageTitle={blogPageData.pageTitle}
      breadcrumbText={blogPageData.breadcrumbText}
      blogData={blogPageData.blogData}
      sideBarData={blogPageData.sideBarData}
    />
  );
};

export default page;
