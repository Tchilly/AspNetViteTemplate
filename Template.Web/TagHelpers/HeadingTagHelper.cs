using Microsoft.AspNetCore.Razor.TagHelpers;

namespace Template.Web.TagHelpers
{
    [HtmlTargetElement("heading")]
    public class HeadingTagHelper : TagHelper
    {
        public string Size { get; set; } = "h1"; // Default to h1

        // Dictionary to map heading sizes to Tailwind CSS classes
        private static readonly Dictionary<string, string> SizeToClassMap = new Dictionary<string, string>
        {
            { "h1", "text-3xl font-bold" },
            { "h2", "text-2xl font-bold" },
            { "h3", "text-xl font-bold" },
            { "h4", "text-base font-semibold" },
            { "h5", "text-sm font-semibold" },
            { "h6", "text-xs font-semibold" }
        };

        public override async Task ProcessAsync(TagHelperContext context, TagHelperOutput output)
        {
            output.TagName = Size.ToLowerInvariant(); // Set the tag name (h1, h2, etc.)

            if (SizeToClassMap.TryGetValue(Size.ToLowerInvariant(), out var cssClass))
            {
                // Add the Tailwind CSS class
                output.Attributes.Add("class", cssClass);
            }

            output.Content.SetHtmlContent((await output.GetChildContentAsync()).GetContent());
        }
    }
}
