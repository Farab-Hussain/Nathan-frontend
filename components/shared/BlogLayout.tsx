import React from "react";
import BlogCard from "@/components/ui/blogs/BlogCard";
import SideBar from "@/components/ui/blogs/SideBar";
import BlogHeader from "@/components/shared/BlogHeader";

interface BlogItem {
  id: string;
  title: string;
  description: string;
  image: string;
  date: string;
  author: string;
  wrapper?: boolean;
}

interface SideBarItem {
  title: string;
  description: string;
  image: string;
}

interface BlogLayoutProps {
  pageTitle: string;
  breadcrumbText: string;
  blogData: BlogItem[];
  sideBarData: SideBarItem[];
}

const BlogLayout = ({ pageTitle, breadcrumbText, blogData, sideBarData }: BlogLayoutProps) => {
  return (
    <section className="bg-white min-h-screen">
      <BlogHeader pageTitle={pageTitle} breadcrumbText={breadcrumbText} />
      <div className="layout py-8">
        {/* Main Content Area - Responsive Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Blog Cards - Takes 2/3 of the space on large screens */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {blogData.map((item, index) => {
              return (
                <BlogCard
                  key={index}
                  id={item.id}
                  title={item.title}
                  description={item.description}
                  image={item.image}
                  date={item.date}
                  author={item.author}
                  wrapper={item.wrapper}
                />
              );
            })}
          </div>
          
          {/* Sidebar - Takes 1/3 of the space on large screens */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            {sideBarData.map((item, index) => {
              return (
                <SideBar
                  key={index}
                  title={item.title}
                  description={item.description}
                  image={item.image}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogLayout; 