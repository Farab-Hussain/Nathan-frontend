import React from "react";
import Image from "next/image";
import BlogCard from "@/components/ui/blogs/BlogCard";

const page = () => {
  return (
    <section className="bg-white min-h-screen">
      <div className="flex gap-6 layout py-8">
        {/* Main Content Area */}
        <main className="flex-1 flex flex-col gap-6">
          <BlogCard
            title={"4 Top Fundraising Challenges for Youth Activities"}
            description={
              "School fundraising is an important aspect of raising money for a variety of activities, events, and programs. That being said, organizing the classic car wash or bake sale fundraiser can be more trouble than it’s worth. Parents are too busy managing family obligations, social commitments, and working on their career goals. Children are often booked solid with school work, sports practice, and extracurricular activities. Gone are the days of organizing walk-a-thons, silent auctions, and raffles. In today’s busy world, nobody has time to coordinate groups of people, secure a location, gather supplies, and pray for good weather. For all that effort, the return is quite meager. While these are all good ideas, they come with their own set of challenges. And so this demands a new approach to youth activities fundraising. Before we delve into what makes school fundraisers successful, let’s review the top fundraising challenges for youth activities."
            }
            image={"/assets/images/blog1.png"}
            date={"Jul 06, 2021"}
            author={"Marie Caphlish"}
          />
        </main>

        {/* Sidebar */}
        <aside className="w-80 flex-shrink-0">
          <div className="sticky top-8 flex flex-col gap-4 bg-red-50 rounded-lg p-6">
            <Image
              src="/assets/images/blog1.png"
              alt="blog"
              width={1000}
              height={1000}
              className="rounded-lg"
            />
            <div className="flex flex-col gap-4">
              <h1 className="text-2xl font-bold">Blog Title</h1>
              <p className="text-sm text-gray-500">Blog Description</p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default page;
