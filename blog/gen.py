import toml
import os

from datetime import datetime

def validate_contents(contents):
    if "heading" not in contents or "content" not in contents:
        return False
    
    if "heading" in contents:
        if "PAGE_TITLE" not in contents["heading"]:
            return False
        if "BLOG_TITLE" not in contents["heading"]:
            return False
        if "DATE" not in contents["heading"]:
            return False
    if "content" in contents:
        if "CONTENT" not in contents["content"]:
            return False
    return True


def main():
    with open("blog.template.html") as blog_template:
        template = blog_template.read()
        list_of_files = []
        for (dirpath, _, filenames) in os.walk("content"):
            for filename in filenames:
                if filename.endswith(".toml"):
                    with open(os.sep.join([dirpath, filename])) as blog_contents:
                        contents = toml.load(blog_contents)
                        if not validate_contents(contents):
                            print("Error: Invalid contents in {}".format(filename))
                            continue
                        else:
                            date = datetime.strptime(contents["heading"]["DATE"], "%d %B %Y")
                            title = contents["heading"]["PAGE_TITLE"]
                            blog_filename = (title + "_" + date.strftime("%Y_%m_%d")).replace(" ", "_") + ".html"
                            with open(blog_filename, "wt") as blog_file:
                                blog_file.write(template.format(**contents["heading"], **contents["content"], LINK=f"https://dc03.github.io/blog/{blog_filename}"))
                            list_of_files.append([date, contents["heading"]["BLOG_TITLE"], blog_filename])

        list_of_files.sort(key=lambda x: x[0], reverse=True)
        for date, blog_title, blog_filename in list_of_files:
            print("{} -> {}".format(blog_title, blog_filename))
        
        with open("index.template.html") as index_template:
            index_template = index_template.read()
            format = """
                <li class="blog">
                    <div class="blog_title">
                        <a href="{BLOG_FILENAME}" class="blog-link">{BLOG_TITLE}</a>
                    </div>
                    <div class="date">{DATE}</div>
                    <hr class="separator" />
                </li>
            """
            links = ""
            for date, blog_title, blog_filename in list_of_files:
                links += format.format(DATE=date.strftime("%d %B %Y"), BLOG_TITLE=blog_title, BLOG_FILENAME=blog_filename )
            with open("index.html", "wt") as index_file:
                index_file.write(index_template.format(LINKS=links))

if __name__ == "__main__":
    main()
