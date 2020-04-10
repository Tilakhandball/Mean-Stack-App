import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

import { Post } from 'src/app/posts/post.model';
import { environment } from '../../environments/environment';

const BACKEND_URL = environment.apiUrl + '/posts/';

@Injectable({ providedIn: 'root' })
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{ posts: Post[], postsCount: number }>();
  constructor(private http: HttpClient, private router: Router) { }

  getPosts = (postsPerPage: number, currentPage: number) => {
    const QueryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
    this.http.get<{ message: string, posts: any, maxPosts: number }>(BACKEND_URL + QueryParams)
      .pipe(map((postData) => {
        return {
          posts: postData.posts.map(post => {
            return {
              title: post.title,
              content: post.content,
              id: post._id,
              imagePath: post.imagePath,
              creator: post.creator
            };
          }),
          maxPosts: postData.maxPosts
        };
      }))
      .subscribe((transformedPost) => {
        this.posts = transformedPost.posts;
        this.postsUpdated.next({ posts: [...this.posts], postsCount: transformedPost.maxPosts });
      });
  }

  getPostUpdateListener = () => {
    return this.postsUpdated.asObservable();
  }

  addPost = (enteredTitle: string, enteredContent: string, image: File) => {
    const postData = new FormData(); // form data is a js obj used to combine both text and blob.
    postData.append('title', enteredTitle);
    postData.append('content', enteredContent);
    postData.append('image', image, enteredTitle);
    this.http.post<{ message: string, post: Post }>(BACKEND_URL, postData).subscribe((res) => {
      // const post: Post = { id: res.post.id, title: enteredTitle, content: enteredContent, imagePath: res.post.imagePath };
      // this.posts.push(post);
      // this.postsUpdated.next([...this.posts]);
      this.router.navigate(['/']);
    });
  }

  getPost = (id: string) => {
    return this.http.get<{ _id: string, title: string, content: string, imagePath: string, creator: string }>
      (BACKEND_URL + id);
    // find method returns the matching object
  }

  updatePost = (updatedId: string, updatedTitle: string, updatedContent: string, image: File | string) => {
    let postData: Post | FormData;
    if (typeof (image) === 'object') {
      postData = new FormData();
      postData.append('id', updatedId);
      postData.append('title', updatedTitle);
      postData.append('content', updatedContent);
      postData.append('image', image, updatedTitle);
    } else {
      postData = { id: updatedId, title: updatedTitle, content: updatedContent, imagePath: image, creator: null };
    }
    this.http.put<{ message: string }>(BACKEND_URL + updatedId, postData).subscribe((res) => {
      // const updatedPosts = [...this.posts];
      // const oldPostIndex = updatedPosts.findIndex(p => p.id === updatedId);
      // const post = { id: updatedId, title: updatedTitle, content: updatedContent, imagePath: '' };
      // updatedPosts[oldPostIndex] = post;
      // this.posts = updatedPosts;
      // this.postsUpdated.next([...this.posts]);
      this.router.navigate(['/']);
    });
  }

  deletePost = (postId: string) => {
    return this.http.delete(BACKEND_URL + postId);
    // .subscribe(() => {
    //   const updatedPosts = this.posts.filter(post => post.id !== postId);
    //   this.posts = updatedPosts;
    //   this.postsUpdated.next([...this.posts]);
    // });
  }
}
