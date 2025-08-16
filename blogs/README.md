# Blog Posts

This folder contains all the blog posts for Ramshankar Bhuvaneswaran's portfolio website.

## Structure

```
blogs/
├── README.md                           # This file
├── llm-guide.html                     # Sample blog post about LLMs
├── llama3-budget-finetuning.html      # Budget-friendly Llama 3.1 fine-tuning with LoRA
├── airflow-etl-pipelines.html         # ETL pipelines with Airflow (planned)
├── pytorch-production-optimization.html # PyTorch optimization (planned)
├── aws-sagemaker-pipeline.html        # AWS SageMaker guide (planned)
├── gnn-financial-applications.html    # GNNs in finance (planned)
├── ml-docker-kubernetes.html          # ML with Docker/K8s (planned)
└── kafka-spark-streaming.html         # Kafka + Spark streaming (planned)
```

## Blog Post Format

Each blog post follows a consistent structure:

### 1. HTML Structure
- **Navigation**: Consistent navigation bar with relative paths (`../`)
- **Header**: Blog post metadata (category, date, reading time)
- **Content**: Main article content with proper headings and formatting
- **Footer**: Author info and related posts

### 2. Content Organization
- **Introduction**: Overview and context
- **Main Sections**: Detailed content with clear headings (H2, H3)
- **Code Blocks**: Technical explanations and examples
- **Conclusion**: Summary and key takeaways
- **Related Posts**: Links to other relevant articles

### 3. Metadata
- **Title**: Descriptive and SEO-friendly
- **Category**: AI/ML, Data Engineering, Cloud & DevOps, Software Development
- **Tags**: Relevant keywords for search and categorization
- **Reading Time**: Estimated time to complete the article

## Categories

### AI & Machine Learning (5 posts)
- Large Language Models and fine-tuning
- PyTorch optimization and deployment
- Graph Neural Networks applications
- Computer Vision and OCR
- Model training and inference

### Data Engineering (3 posts)
- ETL pipeline design with Airflow
- Real-time data processing with Kafka + Spark
- Data architecture and optimization

### Cloud & DevOps (4 posts)
- AWS SageMaker ML pipelines
- Docker and Kubernetes for ML
- Cloud infrastructure and deployment
- MLOps best practices

### Software Development (2 posts)
- Programming best practices
- Software architecture patterns
- Development workflows

## Adding New Blog Posts

1. **Create HTML file** in the `blogs/` folder
2. **Follow the template** structure from existing posts
3. **Update navigation** in all HTML files to include the new post
4. **Add to main blogs page** (`../blogs.html`) in the recent posts section
5. **Update category counts** and related posts links
6. **Test navigation** and relative paths

## File Naming Convention

- Use descriptive, kebab-case filenames
- Include main topic in filename
- Example: `llm-guide.html`, `airflow-etl-pipelines.html`

## Styling

All blog posts use the main `styles.css` file with additional blog-specific styles:
- Blog post headers and metadata
- Content formatting and typography
- Code blocks and technical content
- Responsive design for mobile devices

## SEO Considerations

- Descriptive page titles
- Proper heading hierarchy (H1, H2, H3)
- Meta descriptions and keywords
- Internal linking between related posts
- Clean URL structure

## Maintenance

- Keep navigation links updated
- Ensure all relative paths work correctly
- Update related posts when adding new content
- Maintain consistent formatting across all posts
- Regular review of content accuracy and relevance
